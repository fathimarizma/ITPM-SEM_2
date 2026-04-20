const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    console.log('Protect middleware - Request URL:', req.url);
    console.log('Protect middleware - Headers:', req.headers);
    
    let token;

    if (req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in authorization header');
    }

    if (!token || token === 'none') {
      console.log('No token found');
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Token decoded:', decoded);

      req.user = await User.findById(decoded.id);
      console.log('User found:', req.user);
      
      if (!req.user) {
         console.log('User no longer exists');
         return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      next();
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.log('Protect middleware error:', error);
    next(error);
  }
};

const protectOptional = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'none') {
      return next(); 
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    // If token invalid, just continue as anonymous
    next();
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('restrictTo middleware - User:', req.user);
    console.log('restrictTo middleware - Required roles:', roles);
    console.log('restrictTo middleware - User role:', req.user?.role);
    
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('Access denied - User not found or role not matching');
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    console.log('Access granted - User has required role');
    next();
  };
};

module.exports = { protect, protectOptional, restrictTo };
