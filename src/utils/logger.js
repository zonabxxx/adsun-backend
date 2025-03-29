const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Vytvorenie adresára pre logy, ak neexistuje
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Definícia formátu
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Formátovanie meta údajov na jeden riadok
  let meta = '';
  if (Object.keys(metadata).length > 0) {
    meta = JSON.stringify(metadata);
  }
  
  // Odstránenie možných viacriadkových znakov
  const cleanMessage = message.replace(/\n/g, ' ').replace(/\r/g, ' ');
  
  // Formát "YYYY-MM-DD HH:MM:SS [LEVEL]: správa {metadáta}"
  return `${timestamp} [${level.toUpperCase()}]: ${cleanMessage}${meta ? ' ' + meta : ''}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    // Konzolový transport
    new winston.transports.Console(),
    // Súborový transport pre všetky logy
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Súborový transport len pre chybové logy
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// Rozšírenie pre rôzne typy logov
logger.apiRequest = (req, message) => {
  logger.info(message, {
    userId: req.user ? req.user.id : 'anonymous',
    username: req.user ? req.user.username : 'anonymous',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress
  });
};

logger.auth = (action, user, ip) => {
  logger.info(`AUTH ${action}`, {
    userId: user ? user.id : 'unknown',
    username: user ? user.username : 'unknown',
    ip: ip || 'unknown'
  });
};

logger.adminAccess = (req, granted) => {
  logger.info(`ADMIN_ACCESS ${granted ? 'GRANTED' : 'DENIED'}`, {
    userId: req.user ? req.user.id : 'unknown',
    username: req.user ? req.user.username : 'unknown',
    ip: req.ip || req.connection.remoteAddress,
    url: req.originalUrl
  });
};

module.exports = logger; 