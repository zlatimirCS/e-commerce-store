import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  // getProfile,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
// router.get('/profile', getProfile);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
// router.post('/verify-email', verifyEmail);
// router.post('/verify-email-code', verifyEmailCode);
// router.post('/verify-email-code', verifyEmailCode);

export default router;
