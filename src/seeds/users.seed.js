const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const logger = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(config.db.uri)
  .then(() => {
    logger.info('MongoDB connected for seeding');
    seedUsers();
  })
  .catch(err => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  });

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Default users
    const users = [
      {
        username: 'admin',
        email: 'admin@adsun.sk',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        roleName: 'admin',
        permissions: {
          dashboard: { read: true, write: true },
          zakazky: { read: true, write: true },
          vyroba: { read: true, write: true },
          financie: { read: true, write: true },
          admin: { read: true, write: true }
        }
      },
      {
        username: 'manager',
        email: 'manager@adsun.sk',
        password: 'manager123',
        firstName: 'Manager',
        lastName: 'User',
        roleName: 'manager',
        permissions: {
          dashboard: { read: true },
          zakazky: { read: true, write: true },
          vyroba: { read: true, write: true },
          financie: { read: true }
        }
      },
      {
        username: 'user',
        email: 'user@adsun.sk',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        roleName: 'user',
        permissions: {
          dashboard: { read: true },
          zakazky: { read: true },
          vyroba: { read: true }
        }
      }
    ];

    // Hash passwords manually (bypassing mongoose middleware to ensure consistency)
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(user.password, salt);
      delete user.password; // Odstránime pôvodné heslo
    }

    // Create users
    await User.insertMany(users);
    logger.info('Default users created');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('MongoDB disconnected after seeding');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
}; 