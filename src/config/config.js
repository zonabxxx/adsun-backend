require('dotenv').config();

// Configuration object
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/adsun',
    dbName: process.env.MONGODB_DB_NAME || 'ADsun'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expiry: process.env.JWT_EXPIRY || '15m'
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_here',
    expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  }
};

module.exports = config; 