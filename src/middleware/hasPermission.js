const { flattenPermissions } = require('../utils/permissions');
const logger = require('../utils/logger');

/**
 * Middleware to check if user has required permission
 * @param {String} requiredPermission - The permission to check for
 * @returns {Function} - Express middleware function
 */
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Get user from request (set by verifyToken middleware)
    const user = req.user;
    
    if (!user) {
      logger.warn('Permission check failed: No user in request');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get user permissions
    const permissions = user.permissions || {};
    
    // Logovanie pre kontrolu
    logger.info(`Checking permission ${requiredPermission} for user ${user.username}`);
    logger.debug(`User permissions: ${JSON.stringify(permissions).substring(0, 200)}`);
    
    // Flatten permissions to array
    const flattenedPermissions = flattenPermissions(permissions);
    logger.debug(`Flattened permissions: ${JSON.stringify(flattenedPermissions)}`);
    
    // Admin role alebo admin oprávnenia bypasses permission check
    if (user.roleName === 'admin' || 
        (permissions.admin && (permissions.admin.read === true || permissions.admin.write === true))) {
      logger.info(`Permission ${requiredPermission} granted for admin user ${user.username}`);
      return next();
    }
    
    // Check if user has required permission
    if (flattenedPermissions.includes(requiredPermission)) {
      logger.info(`Permission ${requiredPermission} granted for user ${user.username}`);
      return next();
    }
    
    // Check permissions hierarchically
    const permissionParts = requiredPermission.split('_');
    if (permissionParts.length > 1) {
      const category = permissionParts[0];
      const action = permissionParts[1];
      
      if (permissions[category]) {
        // Kontrola priameho prístupu k celej kategórii
        if (permissions[category][action] === true) {
          logger.info(`Permission ${requiredPermission} granted hierarchically for user ${user.username}`);
          return next();
        }
        
        // Kontrola globálneho write prístupu (write zahŕňa aj read)
        if (action === 'read' && permissions[category].write === true) {
          logger.info(`Read permission granted because of write permission for user ${user.username}`);
          return next();
        }
      }
    }
    
    logger.warn(`Permission denied: User ${user.username} lacks permission ${requiredPermission}`);
    return res.status(403).json({ 
      success: false, 
      message: 'Permission denied' 
    });
  };
};

module.exports = hasPermission; 