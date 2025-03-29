const mongoose = require('mongoose');

const PermissionTemplateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    default: []
  },
  children: {
    type: [{
      id: String,
      name: String,
      permissions: [String]
    }],
    default: []
  }
}, {
  timestamps: true
});

const PermissionTemplate = mongoose.model('PermissionTemplate', PermissionTemplateSchema);

module.exports = PermissionTemplate; 