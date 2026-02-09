const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('../models/User');
const Question = require('../models/Question');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Configure Multer (Temporary storage for uploads)
const upload = multer({ dest: 'uploads/' });

// ... (Keep your existing stats and single question routes here) ...

// @route   POST /api/admin/upload-csv
// @desc    Bulk upload questions from CSV
router.post('/upload-csv', auth, admin, upload.single('file'), (req, res) => {
  const results = [];
  
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // transform CSV row to Database Schema
      // Expects CSV headers: question, category, optionA, optionB, optionC, optionD, correct, explanation
      
      const options = [
        { text: data.optionA, isCorrect: data.correct.trim().toUpperCase() === 'A' },
        { text: data.optionB, isCorrect: data.correct.trim().toUpperCase() === 'B' },
        { text: data.optionC, isCorrect: data.correct.trim().toUpperCase() === 'C' },
        { text: data.optionD, isCorrect: data.correct.trim().toUpperCase() === 'D' }
      ];

      results.push({
        text: data.question,
        category: data.category || 'General',
        options: options,
        explanation: data.explanation || ''
      });
    })
    .on('end', async () => {
      try {
        await Question.insertMany(results);
        fs.unlinkSync(req.file.path); // Delete temp file
        res.json({ message: `Successfully added ${results.length} questions!` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving to database" });
      }
    });
});

module.exports = router;