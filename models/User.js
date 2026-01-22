const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  googleId: { type: String },

  
  // Progression
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  
  // Daily Tracking
  dailyQuestionsCount: { type: Number, default: 0 }, // Tracks questions limit (5)
  dailyXP: { type: Number, default: 0 },             // Tracks today's points
  lastQuizDate: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },

  // Graph Data (Last 7 days)
  xpHistory: [{
    date: { type: String }, // Format: "Mon", "Tue" or "YYYY-MM-DD"
    xp: { type: Number }
  }],

  // Subscription
  isPremium: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);