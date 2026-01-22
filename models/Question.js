// server/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, default: 'General' }, // e.g., "Network Security"
  options: [{ 
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  explanation: { type: String }, // Shown after answering
  xpReward: { type: Number, default: 10 }
});

module.exports = mongoose.model('Question', questionSchema);