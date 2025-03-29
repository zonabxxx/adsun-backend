const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const path = require('path');
const fs = require('fs');
const { hasPermission } = require('../utils/permissions');
const logger = require('../utils/logger');

// Diagnostický endpoint bez autentifikácie
router.get('/debug-templates', async (req, res) => {
  try {
    const PermissionTemplate = require('../models/permissionTemplate.model');
    const templates = await PermissionTemplate.find({});
    
    res.status(200).json({
      success: true,
      count: templates.length,
      templates: templates
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Všetky admin routes vyžadujú autentifikáciu a admin práva
router.use(verifyToken);
router.use(isAdmin);

// Endpoint pre získanie logov zo súboru
router.get('/logs', async (req, res) => {
  try {
    const { type = 'combined', includeDb = 'false', limit = 100 } = req.query;
    let logs = [];
    
    // Načítanie súborových logov
    let logPath;
    if (type === 'error') {
      logPath = path.join(__dirname, '../../logs/error.log');
    } else {
      logPath = path.join(__dirname, '../../logs/combined.log');
    }
    
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      
      if (content) {
        // Rozbijeme obsah súboru na riadky
        const lines = content.split('\n');
        let currentLog = null;
        
        // Prejdeme každý riadok
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (!line.trim()) continue; // Preskočíme prázdne riadky
          
          // Kontrola, či riadok vyzerá ako začiatok nového log záznamu
          // Vzor: "YYYY-MM-DD HH:MM:SS [LOG_LEVEL]: správa"
          const logMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\]: (.+)/);
          
          if (logMatch) {
            // Uložíme predchádzajúci log, ak existuje
            if (currentLog) {
              logs.push(currentLog);
            }
            
            // Vytvoríme nový log
            currentLog = {
              timestamp: logMatch[1],
              level: logMatch[2],
              message: logMatch[3],
              source: 'file'
            };
          } else if (currentLog) {
            // Ak to nie je nový log, pridáme riadok k správe predchádzajúceho logu
            currentLog.message += '\n' + line;
          }
        }
        
        // Pridáme posledný log
        if (currentLog) {
          logs.push(currentLog);
        }
      }
    }
    
    // Načítanie MongoDB logov, ak je to požadované
    if (includeDb === 'true') {
      try {
        const Log = require('../models/log.model');
        const dbLogs = await Log.find({})
          .sort({ timestamp: -1 })
          .limit(parseInt(limit))
          .lean();
        
        // Transformácia MongoDB logov do rovnakého formátu
        const formattedDbLogs = dbLogs.map(log => ({
          timestamp: new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19),
          level: log.level,
          message: log.message,
          details: log.details || '',
          user: log.user,
          module: log.module,
          source: 'database'
        }));
        
        // Spojenie logov
        logs = [...logs, ...formattedDbLogs];
        
        // Zoradenie všetkých logov podľa času (najnovšie najprv)
        logs.sort((a, b) => {
          const dateA = new Date(a.timestamp.replace(' ', 'T'));
          const dateB = new Date(b.timestamp.replace(' ', 'T'));
          return dateB - dateA;
        });
        
        // Limitovanie celkového počtu logov
        logs = logs.slice(0, parseInt(limit));
      } catch (dbErr) {
        console.error('Error fetching database logs:', dbErr);
        logger.error(`Error fetching database logs: ${dbErr.message}`);
      }
    }
    
    // Vrátime logy
    return res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    logger.error(`Error getting logs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Error getting logs: ${error.message}`
    });
  }
});

// Endpoint pre vymazanie logov
router.delete('/logs', async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../../logs/combined.log');
    const errorLogPath = path.join(__dirname, '../../logs/error.log');
    
    logger.info(`Clearing logs from paths: ${logPath}, ${errorLogPath}`);
    
    // Kontrola existencie adresára logs
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      logger.info(`Creating logs directory: ${logsDir}`);
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Vymazanie a znovu vytvorenie súborov
    try {
      // Ak existujú, skús vytvoriť zálohu v adresári logs
      if (fs.existsSync(logPath)) {
        const backupPath = path.join(logsDir, 'combined_backup.log');
        try {
          fs.copyFileSync(logPath, backupPath);
          logger.info(`Log backup created at: ${backupPath}`);
        } catch (backupError) {
          logger.warn(`Could not create backup: ${backupError.message}`);
        }
      }
      
      // Vymazanie a vytvorenie prázdneho súboru
      fs.writeFileSync(logPath, '', { encoding: 'utf8', flag: 'w' });
      logger.info('Combined log file cleared');
      
      // To isté pre error log
      if (fs.existsSync(errorLogPath)) {
        const errorBackupPath = path.join(logsDir, 'error_backup.log');
        try {
          fs.copyFileSync(errorLogPath, errorBackupPath);
          logger.info(`Error log backup created at: ${errorBackupPath}`);
        } catch (backupError) {
          logger.warn(`Could not create error log backup: ${backupError.message}`);
        }
      }
      
      // Vymazanie a vytvorenie prázdneho súboru pre error logy
      fs.writeFileSync(errorLogPath, '', { encoding: 'utf8', flag: 'w' });
      logger.info('Error log file cleared');
      
      // Pridáme nový záznam o vymazaní logov
      logger.info(`Logs cleared by user: ${req.user.username}`);
      
      return res.status(200).json({
        success: true,
        message: 'Logy boli úspešne vymazané'
      });
    } catch (fileError) {
      logger.error(`Error during file operations: ${fileError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Chyba pri vymazávaní logov',
        error: fileError.message
      });
    }
  } catch (error) {
    logger.error(`Error clearing logs: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri vymazávaní logov',
      error: error.message
    });
  }
});

// Endpoint pre stiahnutie logov
router.get('/logs/download', async (req, res) => {
  try {
    const { type = 'combined' } = req.query;
    let logPath;
    
    if (type === 'error') {
      logPath = path.join(__dirname, '../../logs/error.log');
    } else {
      logPath = path.join(__dirname, '../../logs/combined.log');
    }
    
    logger.info(`Downloading logs from path: ${logPath}`);
    
    // Kontrola, či súbor existuje
    if (!fs.existsSync(logPath)) {
      logger.warn('Log file not found for download at path:', logPath);
      return res.status(404).json({
        success: false,
        message: 'Log file not found'
      });
    }
    
    // Nastavenie hlavičiek pre stiahnutie súboru
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_logs.log`);
    
    // Odoslanie súboru
    const fileStream = fs.createReadStream(logPath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Error downloading logs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Chyba pri sťahovaní logov',
      error: error.message
    });
  }
});

// Správa používateľov
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/permissions', adminController.updateUserPermissions);
router.delete('/users/:id', adminController.deleteUser);

// Oprávnenia a role routes
router.get('/roles', adminController.getRoles);
router.get('/roles/:id', adminController.getRoleById);
router.post('/roles', adminController.createRole);
router.put('/roles/:id', adminController.updateRole);
router.delete('/roles/:id', adminController.deleteRole);
router.get('/permissions', adminController.getPermissions);
router.patch('/roles/:id/permissions', adminController.updateRolePermissions);

// Permission templates
router.get('/permission-templates', adminController.getPermissionTemplates);

// Systémové nastavenia
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router; 