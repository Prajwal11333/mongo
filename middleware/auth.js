import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - middleware for checking if user is logged in
export const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // Make sure token exists
  if (!token) {
    return res.status(401).redirect('/login');
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).redirect('/login');
  }
};

// Generate JWT Token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Check if user is logged in for conditional rendering
export const isLoggedIn = (req, res, next) => {
  let token;
  
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.isAuthenticated = true;
      res.locals.currentUser = decoded;
    } catch (error) {
      res.locals.isAuthenticated = false;
      res.locals.currentUser = null;
    }
  } else {
    res.locals.isAuthenticated = false;
    res.locals.currentUser = null;
  }
  
  next();
};