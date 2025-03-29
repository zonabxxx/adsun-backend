const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const adminRoutes = require('./routes/admin.routes');
const backupRoutes = require('./routes/backup.routes');
const directRoutes = require('./routes/direct.routes');
const workflowRoutes = require('./routes/workflow.routes');
const clientRoutes = require('./routes/client.routes');

// Import utils
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Configure trust proxy setting
app.set('trust proxy', 1); // Trust first proxy, needed for express-rate-limit to work properly with X-Forwarded-For

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Increase header size limits to avoid 431 errors - significantly increase the limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply middleware
app.use(cors({
  // CORS configuration with increased header size
  origin: process.env.FRONTEND_URL || ['http://localhost:3002', 'https://www.edon.sk', 'http://www.edon.sk'],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
  exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
}));
app.use(helmet({
  // Adjust helmet settings to allow larger headers
  frameguard: {
    action: 'deny'
  },
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increase from 100 to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// Higher rate limit for direct API routes that need frequent access
const directApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for direct API routes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Direct API rate limit exceeded: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// Registrácia hlavného routera s indexom
const indexRoutes = require('./routes/index');
app.use('/api', indexRoutes);

// Pridanie direct routes s vyšším rate limitom
app.use('/api/direct', directApiLimiter);
app.use('/api/direct', directRoutes);

// Apply general rate limiting to all other API routes
app.use('/api/', apiLimiter);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', menuRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/clients', clientRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app; 