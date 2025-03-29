/**
 * Routy pre priame operácie s databázou
 */
const express = require('express');
const router = express.Router();
const directController = require('../controllers/direct.controller');

// Routy pre workflow fázy
router.get('/workflow-phases', directController.getWorkflowPhases);
router.post('/workflow-phases', directController.saveWorkflowPhases);

// Routy pre permission templates
router.post('/permission-templates/zakazky', directController.updateZakazkyPermissionTemplate);

// Routy pre menu kategórie
router.post('/create-workflow-category', directController.createWorkflowMainCategory);

module.exports = router; 