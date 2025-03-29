const { verifyAccessToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = (req, res, next) => {
  logger.info('Auth middleware called at:', new Date().toISOString());
  // Get auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized access attempt: No token provided');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  // Verify token
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    logger.warn('Unauthorized access attempt: Invalid token');
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
  
  // Add user data to request
  req.user = decoded;
  
  next();
};

module.exports = verifyToken; 