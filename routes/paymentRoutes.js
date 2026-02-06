// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Headers required for every Paystack request
const PAYSTACK_HEADERS = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Make sure this is in your .env
  'Content-Type': 'application/json'
};

// Pricing Configuration
// Paystack expects amounts in the smallest currency unit (Kobo for NGN, Cents for USD)
const PRICES = {
  ngn: { 
    month: 1500 * 100, // ₦1,500.00 -> 150,000 kobo
    year: 10000 * 100  // ₦10,000.00 -> 1,000,000 kobo
  },
  usd: { 
    month: 399,        // $3.99 -> 399 cents
    year: 3000         // $30.00 -> 3000 cents
  }
};

// @route   POST /api/payment/initialize
// @desc    Start a transaction
router.post('/initialize', auth, async (req, res) => {
  // 1. Get user inputs. Default to NGN/Month if missing.
  // 'currency' comes from the frontend (e.g., 'ngn' or 'cad')
  const { currency = 'ngn', interval = 'month', email } = req.body;
  const user = req.user;

  // 2. Logic: Handle International Payments
  // Paystack supports USD. If frontend sends 'cad' (Canada), we charge in USD.
  let chargeCurrency = currency === 'ngn' ? 'NGN' : 'USD';
  let priceKey = currency === 'ngn' ? 'ngn' : 'usd';

  // 3. Get the correct price
  let amount = PRICES[priceKey][interval];

  try {
    // 4. Call Paystack API
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email,
      amount: amount,
      currency: chargeCurrency,
      // Where to send user after payment. 
      // If locally: http://localhost:5173/dashboard
      // If live: https://your-site.com/dashboard
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`,
      metadata: {
        userId: user.id,
        plan: `${chargeCurrency}-${interval}`
      }
    }, { headers: PAYSTACK_HEADERS });

    // 5. Send the Paystack URL to the frontend
    res.json({ url: response.data.data.authorization_url });

  } catch (err) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// @route   GET /api/payment/verify/:reference
// @desc    Confirm payment was successful
router.get('/verify/:reference', auth, async (req, res) => {
  const { reference } = req.params;

  try {
    // 1. Ask Paystack: "Is this reference valid?"
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: PAYSTACK_HEADERS
    });

    const data = response.data.data;

    // 2. If status is success, upgrade the user
    if (data.status === 'success') {
      await User.findByIdAndUpdate(req.user.id, { isPremium: true });
      return res.json({ success: true, message: 'Payment verified and User Upgraded' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment failed' });
    }

  } catch (err) {
    console.error("Verification Error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;