const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get token from header
  // We check for the standard "Authorization: Bearer <token>" format
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Split the string "Bearer eyJhbG..." and take the second part
    token = req.headers.authorization.split(' ')[1];
  } 
  // Fallback: Check for "x-auth-token" (Legacy support for Postman)
  else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;