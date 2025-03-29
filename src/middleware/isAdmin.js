const logger = require('../utils/logger');

/**
 * Middleware to check if user has admin permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  // Get user from request (set by verifyToken middleware)
  const user = req.user;
  
  if (!user) {
    logger.warn('Admin check failed: No user in request');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  // Skontrolujeme oprávnenia používateľa
  const hasAdminPermission = user.permissions && 
                             user.permissions.admin && 
                             (user.permissions.admin.read === true || user.permissions.admin.write === true);
  
  const hasAdminRole = user.roleName === 'admin';
  
  // Kontrola, či používateľ má oprávnenia pre admin sekciu
  if (hasAdminPermission) {
    // Používateľ má oprávnenia na čítanie alebo zápis v admin sekcii
    logger.adminAccess(req, true, 'Používateľ má admin oprávnenia');
    next();
  } else if (hasAdminRole) {
    // Fallback pre spätnú kompatibilitu - používateľ má admin rolu
    logger.adminAccess(req, true, 'Používateľ má admin rolu');
    next();
  } else {
    // Používateľ nemá admin oprávnenia ani rolu
    logger.adminAccess(req, false, 'Používateľ nemá admin oprávnenia ani rolu');
    return res.status(403).json({ 
      success: false, 
      message: 'Admin permission required' 
    });
  }
};

module.exports = isAdmin; 