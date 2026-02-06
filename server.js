require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const Stripe = require('stripe'); // <--- DELETED

const app = express();

// ---------------------------------------------------------
// 1. CORS CONFIGURATION
// ---------------------------------------------------------
app.use(cors({
  origin: ['http://localhost:5173', 'https://gamifiedapp.onrender.com'], // Add your live URL here
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// ---------------------------------------------------------
// 2. MIDDLEWARE
// ---------------------------------------------------------
app.use(express.json());

// ---------------------------------------------------------
// 3. DATABASE CONNECTION
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// ---------------------------------------------------------
// 4. API ROUTES
// ---------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ---------------------------------------------------------
// 5. START SERVER
// ---------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));