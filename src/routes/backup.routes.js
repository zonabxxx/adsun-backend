const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const verifyToken = require('../middleware/verifyToken');
const checkPermission = require('../middleware/checkPermission');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { flattenPermissions } = require('../utils/permissions');
const logger = require('../utils/logger');

// Middleware pre verifikáciu tokenu z query parametra
const verifyTokenFromQuery = async (req, res, next) => {
  // Najprv skúsime získať token z hlavičky (ak už bol nastavený verifyToken middleware)
  if (req.user) {
    return next();
  }
  
  // Ak token nie je v hlavičke, skúsime ho získať z query parametra
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    // Verifikácia tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Načítanie používateľa
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    
    // Nastavenie používateľa do request objektu
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware pre kontrolu oprávnenia z query parametra
const checkPermissionFromQuery = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Admin role bypass permission check
    if (user?.roleName === 'admin') {
      return next();
    }
    
    // Get user permissions
    const permissions = user?.permissions || {};
    
    // Flatten permissions to array
    const flattenedPermissions = flattenPermissions(permissions);
    
    // Check if user has required permission
    if (!flattenedPermissions.includes(requiredPermission)) {
      logger.warn(`Permission denied: User ${user?.username} lacks permission ${requiredPermission}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Permission denied' 
      });
    }
    
    next();
  };
};

// Získanie zoznamu všetkých záloh
router.get('/', verifyToken, checkPermission('admin_backups_read'), backupController.getAllBackups);

// Vytvorenie novej zálohy
router.post('/', verifyToken, checkPermission('admin_backups_write'), backupController.createBackup);

// Stiahnutie zálohy - používať verifyTokenFromQuery namiesto verifyToken
router.get('/download/:fileName', verifyTokenFromQuery, checkPermissionFromQuery('admin_backups_read'), backupController.downloadBackup);

// Odstránenie zálohy
router.delete('/:fileName', verifyToken, checkPermission('admin_backups_write'), backupController.deleteBackup);

module.exports = router; 