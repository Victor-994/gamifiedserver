const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const verifyToken = require('../middleware/authMiddleware');

// Middleware: Check Limits & Reset Daily Stats
const checkDailyLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    const lastQuiz = new Date(user.lastQuizDate);

    // If it's a new day (different date string)
    if (today.toDateString() !== lastQuiz.toDateString()) {
      user.dailyQuestionsCount = 0;
      user.dailyXP = 0; // Reset daily points
      user.lastQuizDate = today;
      await user.save();
    }

    if (!user.isPremium && user.dailyQuestionsCount >= 1) {
      return res.status(403).json({ message: "Daily limit reached.", code: "LIMIT_REACHED" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

router.get('/questions', verifyToken, checkDailyLimit, async (req, res) => {
  const questions = await Question.aggregate([{ $sample: { size: 5 } }]);
  res.json(questions);
});

// SUBMIT ANSWER (The Fix for XP Recording)
router.post('/submit', verifyToken, async (req, res) => {
  const { xpEarned } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    // 1. Update Basic Stats
    user.dailyQuestionsCount += 1;
    user.xp += xpEarned;
    user.dailyXP += xpEarned;

    // 2. Level Up Logic (100 Points per Level)
    user.level = Math.floor(user.xp / 100) + 1;

    // 3. Update Graph History
    // Check if we already have an entry for "Today" (e.g., "Mon")
    const historyIndex = user.xpHistory.findIndex(h => h.date === todayStr);
    
    if (historyIndex > -1) {
      // Update existing day
      user.xpHistory[historyIndex].xp += xpEarned;
    } else {
      // Start new day
      user.xpHistory.push({ date: todayStr, xp: xpEarned });
      // Keep only last 7 days to save space
      if (user.xpHistory.length > 7) user.xpHistory.shift(); 
    }
    
    await user.save();
    res.json({ success: true, newXP: user.xp, level: user.level });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;