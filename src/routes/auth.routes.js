const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/verify', verifyToken, authController.verifyToken);
router.post('/logout', verifyToken, authController.logout);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);
router.put('/email-server', verifyToken, authController.updateEmailServer);
router.post('/test-email-server', verifyToken, authController.testEmailServer);

module.exports = router; 