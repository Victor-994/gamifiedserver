// server/scripts/seed.js
require('dotenv').config(); // Make sure you have dotenv installed
const mongoose = require('mongoose');
const Question = require('../models/Question');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.log(err));

const questions = [
  {
    text: "What is the primary purpose of a firewall in network security?",
    category: "Network Security",
    xpReward: 10,
    options: [
      { text: "To encrypt all network traffic automatically", isCorrect: false },
      { text: "To monitor and control incoming and outgoing network traffic", isCorrect: true },
      { text: "To speed up internet connection", isCorrect: false }
    ],
    explanation: "A firewall acts as a barrier between a trusted network and an untrusted network, monitoring traffic based on security rules."
  },
  {
    text: "What does VPN stand for?",
    category: "Network Security",
    xpReward: 10,
    options: [
      { text: "Virtual Public Network", isCorrect: false },
      { text: "Verified Private Network", isCorrect: false },
      { text: "Virtual Private Network", isCorrect: true }
    ],
    explanation: "VPN stands for Virtual Private Network, which creates a secure, encrypted connection over a less secure network like the internet."
  },
  {
    text: "Which protocol is most secure for web browsing?",
    category: "Web Security",
    xpReward: 10,
    options: [
      { text: "HTTP", isCorrect: false },
      { text: "HTTPS", isCorrect: true },
      { text: "FTP", isCorrect: false }
    ],
    explanation: "HTTPS (Hypertext Transfer Protocol Secure) encrypts data between your browser and the website, unlike HTTP which sends data in plain text."
  },
  {
    text: "What is 'Phishing'?",
    category: "Cyber Threats",
    xpReward: 10,
    options: [
      { text: "A technique to catch fish using Wi-Fi", isCorrect: false },
      { text: "Testing network speeds", isCorrect: false },
      { text: "Fraudulent attempt to obtain sensitive information", isCorrect: true }
    ],
    explanation: "Phishing is a social engineering attack used to steal user data, including login credentials and credit card numbers."
  },
  {
    text: "Which of the following is considered a strong password?",
    category: "Best Practices",
    xpReward: 10,
    options: [
      { text: "password123", isCorrect: false },
      { text: "Tr0ub4dor&3", isCorrect: true },
      { text: "admin", isCorrect: false }
    ],
    explanation: "Strong passwords contain a mix of uppercase and lowercase letters, numbers, and symbols, and are not easily guessable words."
  }
];

const seedDB = async () => {
  await Question.deleteMany({}); // Clear existing questions
  await Question.insertMany(questions);
  console.log("Database Seeded with 5 Questions!");
  mongoose.connection.close();
};

seedDB();