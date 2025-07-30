const express = require('express');
const {
  register,
  login,
  googleAuth,
  verifyDeviceToken,
  getMe,
  updateProfile,
  logout
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-device', verifyDeviceToken);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.post('/logout', auth, logout);

module.exports = router;