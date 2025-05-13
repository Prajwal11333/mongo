import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logout, 
  getCurrentUser 
} from '../controllers/authcontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;