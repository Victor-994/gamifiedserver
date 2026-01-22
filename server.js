require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Stripe = require('stripe');
const User = require('./models/User'); 

const app = express();

// ---------------------------------------------------------
// 1. CORS CONFIGURATION (CRITICAL FIX)
// ---------------------------------------------------------
app.use(cors({
  origin: 'http://localhost:5173', // ⚠️ MUST BE EXACT MATCH. No '*' allowed with credentials.
  credentials: true,               // Allows cookies/tokens
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// ---------------------------------------------------------
// 2. STRIPE WEBHOOK (Must come BEFORE express.json)
// ---------------------------------------------------------
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// We use express.raw() specifically for this route
app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`⚠️  Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId; // We attached this in paymentRoutes.js
    console.log(`💰 Payment successful for User ID: ${userId}`);

    try {
      await User.findByIdAndUpdate(userId, { isPremium: true });
      console.log('✅ User upgraded to Premium');
    } catch (err) {
      console.error('Error updating user:', err);
    }
  }

  response.send();
});

// ---------------------------------------------------------
// 3. STANDARD MIDDLEWARE
// ---------------------------------------------------------
// Parse JSON for all other routes (Login, Quiz, etc.)
app.use(express.json());

// ---------------------------------------------------------
// 4. DATABASE CONNECTION
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// ---------------------------------------------------------
// 5. API ROUTES
// ---------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ---------------------------------------------------------
// 6. START SERVER
// ---------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));