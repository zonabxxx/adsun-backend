const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const verifyToken = require('../middleware/verifyToken');

// Aplikujem auth middleware na všetky routes
router.use(verifyToken);

// Routes pre získanie workflow modulov a súvisiacich dát
router.get('/modules', workflowController.getWorkflowModules);
router.get('/emails/recent', workflowController.getRecentEmails);
router.get('/quotes/recent', workflowController.getRecentQuotes);

// Routy pre emailovú komunikáciu
router.get('/emails/inbox', workflowController.getInboxEmails);
router.get('/emails/sent', workflowController.getSentEmails);
router.post('/emails/:emailId/mark-processed', workflowController.markEmailAsProcessed);

// Routy pre produktové kategórie a cenové ponuky
router.get('/product-categories', workflowController.getProductCategories);
router.get('/products/:categoryId', workflowController.getProductsByCategory);
router.post('/quotes', workflowController.createQuote);

module.exports = router; 