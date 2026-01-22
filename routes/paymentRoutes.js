// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { userId, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'ngn',
          product_data: {
            name: 'Premium Quiz Access',
            description: 'Unlimited daily questions',
          },
          unit_amount: 3000 * 100, // 3000 Naira in kobo
        },
        quantity: 1,
      }],
      mode: 'payment', // Use 'subscription' if you set up a recurring product in Stripe Dashboard
      success_url: 'http://localhost:5173/dashboard?success=true',
      cancel_url: 'http://localhost:5173/dashboard?canceled=true',
      metadata: { userId: userId } // Crucial: This lets the Webhook know WHO paid
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

module.exports = router;