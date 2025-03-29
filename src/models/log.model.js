const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  module: {
    type: String,
    required: true
  },
  user: {
    type: String,
    default: 'system'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  __v: {
    type: Number,
    select: false
  }
});

// Index pre rýchle vyhľadávanie podľa časovej značky
logSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Log', logSchema); 