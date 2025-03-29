require('dotenv').config();
const app = require('./app');
const http = require('http');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Nastavenie portu z premenných prostredia alebo defaultne 3001
const PORT = process.env.PORT || 3001;

// Create HTTP server with custom header size limits
const server = http.createServer({
  // Nastavíme veľkú hodnotu pre maxHeaderSize pre riešenie problému 431
  maxHeaderSize: 1024 * 1024 // 1MB - significantly increase the default 8KB limit
}, app);

// Connect to MongoDB
connectDB().then(() => {
  // Start the server
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}).catch(err => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
}); 