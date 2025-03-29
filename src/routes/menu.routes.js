const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const verifyToken = require('../middleware/verifyToken');

// Get authorized menu for user
router.get('/authorized-menu', verifyToken, menuController.getAuthorizedMenu);

module.exports = router; 