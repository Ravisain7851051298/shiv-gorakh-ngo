const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { optionalAvatarUpload } = require('../middlewares/image-upload.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logoutUser);

router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, optionalAvatarUpload, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
