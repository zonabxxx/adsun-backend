const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const verifyToken = require('../middleware/verifyToken');
const hasPermission = require('../middleware/hasPermission');

// Aplikujem auth middleware na všetky routes
router.use(verifyToken);

/**
 * @route GET /api/clients
 * @desc Získa zoznam klientov
 * @access Private
 */
router.get('/', hasPermission('clients.read'), clientController.getClients);

/**
 * @route GET /api/clients/email/:email
 * @desc Vyhľadá klienta podľa emailovej adresy
 * @access Private
 */
router.get('/email/:email', hasPermission('clients.read'), clientController.findClientByEmail);

/**
 * @route POST /api/clients/process-email/:emailId
 * @desc Spracuje email pre detekciu klienta
 * @access Private
 */
router.post('/process-email/:emailId', hasPermission('clients.read'), clientController.processEmailForClient);

/**
 * @route GET /api/clients/:id
 * @desc Získa detaily klienta podľa ID
 * @access Private
 */
router.get('/:id', hasPermission('clients.read'), clientController.getClientById);

/**
 * @route POST /api/clients
 * @desc Vytvorí nového klienta
 * @access Private
 */
router.post('/', hasPermission('clients.write'), clientController.createClient);

/**
 * @route PUT /api/clients/:id
 * @desc Aktualizuje klienta podľa ID
 * @access Private
 */
router.put('/:id', hasPermission('clients.write'), clientController.updateClient);

/**
 * @route DELETE /api/clients/:id
 * @desc Označí klienta ako neaktívneho
 * @access Private
 */
router.delete('/:id', hasPermission('clients.delete'), clientController.deleteClient);

/**
 * @route POST /api/clients/:id/communication
 * @desc Pridá novú komunikáciu ku klientovi
 * @access Private
 */
router.post('/:id/communication', hasPermission('clients.write'), clientController.addCommunication);

/**
 * @route POST /api/clients/:id/contacts
 * @desc Pridá kontakt ku klientovi
 * @access Private
 */
router.post('/:id/contacts', hasPermission('clients.write'), clientController.addContact);

module.exports = router; 