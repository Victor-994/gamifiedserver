const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user.id comes from the previous authMiddleware
    const user = await User.findById(req.user.id);
    
    if (user && user.isAdmin) {
      next(); // Allowed
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = adminMiddleware;