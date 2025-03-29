const Client = require('../models/client.model');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Získa zoznam klientov
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search, sort = 'name', direction = 'asc' } = req.query;
    
    // Filtrovanie podľa typu
    const filter = {};
    if (type) {
      filter.type = type;
    }
    
    // Fulltextové vyhľadávanie
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { ico: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'contacts.name': { $regex: search, $options: 'i' } },
        { 'contacts.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Zoradenie
    const sortOptions = {};
    sortOptions[sort] = direction === 'asc' ? 1 : -1;
    
    // Získanie počtu záznamov pre pagination
    const totalCount = await Client.countDocuments(filter);
    
    // Konvertujeme page a limit na čísla
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Získanie záznamov s pagináciou
    const clients = await Client.find(filter)
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-communication') // Vynecháme históriu komunikácie pre zrýchlenie
      .lean();
    
    return res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    logger.error('Chyba pri získavaní klientov:', error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní klientov',
      error: error.message
    });
  }
};

/**
 * Získa detaily klienta podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatné ID klienta'
      });
    }
    
    const client = await Client.findById(id).lean();
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s týmto ID nebol nájdený'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Chyba pri získavaní klienta s ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní detailov klienta',
      error: error.message
    });
  }
};

/**
 * Vytvorí nového klienta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createClient = async (req, res) => {
  try {
    const clientData = req.body;
    
    // Pridanie metadát o vytvorení
    clientData.createdAt = new Date();
    clientData.updatedAt = new Date();
    
    if (req.user && req.user._id) {
      clientData.createdBy = req.user._id;
      clientData.updatedBy = req.user._id;
    }
    
    // Validácia povinných údajov
    if (!clientData.name) {
      return res.status(400).json({
        success: false,
        message: 'Meno klienta je povinné'
      });
    }
    
    // Vytvorenie klienta
    const newClient = new Client(clientData);
    const savedClient = await newClient.save();
    
    return res.status(201).json({
      success: true,
      message: 'Klient bol úspešne vytvorený',
      data: savedClient
    });
  } catch (error) {
    logger.error('Chyba pri vytváraní klienta:', error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri vytváraní klienta',
      error: error.message
    });
  }
};

/**
 * Aktualizuje klienta podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatné ID klienta'
      });
    }
    
    // Pridanie metadát o aktualizácii
    updateData.updatedAt = new Date();
    
    if (req.user && req.user._id) {
      updateData.updatedBy = req.user._id;
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s týmto ID nebol nájdený'
      });
    }
    
    // Aktualizácia klienta
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Klient bol úspešne aktualizovaný',
      data: updatedClient
    });
  } catch (error) {
    logger.error(`Chyba pri aktualizácii klienta s ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii klienta',
      error: error.message
    });
  }
};

/**
 * Odstráni klienta podľa ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatné ID klienta'
      });
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s týmto ID nebol nájdený'
      });
    }
    
    // Namiesto fyzického odstránenia označíme klienta ako neaktívneho
    client.isActive = false;
    client.updatedAt = new Date();
    
    if (req.user && req.user._id) {
      client.updatedBy = req.user._id;
    }
    
    await client.save();
    
    return res.status(200).json({
      success: true,
      message: 'Klient bol úspešne deaktivovaný'
    });
  } catch (error) {
    logger.error(`Chyba pri odstraňovaní klienta s ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri odstraňovaní klienta',
      error: error.message
    });
  }
};

/**
 * Vyhľadá klienta podľa emailovej adresy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findClientByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email je povinný parameter'
      });
    }
    
    // Hľadáme klienta podľa primárneho emailu
    let client = await Client.findOne({ email: email.toLowerCase() }).lean();
    
    // Ak nie je nájdený, hľadáme v kontaktoch
    if (!client) {
      client = await Client.findOne({ 'contacts.email': email.toLowerCase() }).lean();
    }
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s touto emailovou adresou nebol nájdený'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error(`Chyba pri hľadaní klienta s emailom ${req.params.email}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri hľadaní klienta podľa emailu',
      error: error.message
    });
  }
};

/**
 * Pridá novú komunikáciu ku klientovi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, subject, content } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatné ID klienta'
      });
    }
    
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Typ a obsah komunikácie sú povinné údaje'
      });
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s týmto ID nebol nájdený'
      });
    }
    
    // Vytvorenie záznamu komunikácie
    const communication = {
      date: new Date(),
      type,
      subject,
      content
    };
    
    if (req.user && req.user._id) {
      communication.userId = req.user._id;
    }
    
    // Pridanie komunikácie ku klientovi
    client.communication.push(communication);
    client.updatedAt = new Date();
    
    if (req.user && req.user._id) {
      client.updatedBy = req.user._id;
    }
    
    await client.save();
    
    return res.status(200).json({
      success: true,
      message: 'Komunikácia bola úspešne pridaná',
      data: communication
    });
  } catch (error) {
    logger.error(`Chyba pri pridávaní komunikácie ku klientovi s ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri pridávaní komunikácie',
      error: error.message
    });
  }
};

/**
 * Spracuje email pre detekciu klienta
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processEmailForClient = async (req, res) => {
  try {
    const { emailId } = req.params;
    
    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: 'ID emailu je povinný parameter'
      });
    }
    
    // Import je tu kvôli zabráneniu cyklických závislostí
    const emailParser = require('../utils/emailParser');
    const WorkflowController = require('./workflow.controller');
    
    // Získanie emailu
    const email = await WorkflowController.getEmailById(emailId);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email s týmto ID nebol nájdený'
      });
    }
    
    // Spracovanie emailu pre detekciu klienta
    const result = await emailParser.processEmailForClientDetection(email);
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`Chyba pri spracovaní emailu pre detekciu klienta (ID: ${req.params.emailId}):`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri spracovaní emailu pre detekciu klienta',
      error: error.message
    });
  }
};

/**
 * Pridá kontakt ku klientovi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatné ID klienta'
      });
    }
    
    if (!contactData.name || !contactData.email) {
      return res.status(400).json({
        success: false,
        message: 'Meno a email kontaktu sú povinné údaje'
      });
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Klient s týmto ID nebol nájdený'
      });
    }
    
    // Ak pridávame predvolený kontakt, zrušíme predvolené nastavenie u ostatných
    if (contactData.isDefault) {
      client.contacts.forEach(contact => {
        contact.isDefault = false;
      });
    }
    
    // Pridanie kontaktu
    client.contacts.push(contactData);
    client.updatedAt = new Date();
    
    if (req.user && req.user._id) {
      client.updatedBy = req.user._id;
    }
    
    await client.save();
    
    return res.status(200).json({
      success: true,
      message: 'Kontakt bol úspešne pridaný',
      data: contactData
    });
  } catch (error) {
    logger.error(`Chyba pri pridávaní kontaktu ku klientovi s ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri pridávaní kontaktu',
      error: error.message
    });
  }
}; 