/**
 * Main router for the application
 */
const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
router.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Export the router
module.exports = router; 