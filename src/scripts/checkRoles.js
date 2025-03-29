require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/role.model');

async function checkRoles() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI nie je nastavené v .env súbore');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to external MongoDB');

    const roles = await Role.find({});
    console.log('\nRoles in database:');
    roles.forEach(role => {
      console.log(`\nRole: ${role.name} (${role.isSystem ? 'System' : 'Custom'})`);
      console.log('Permissions:', JSON.stringify(role.defaultPermissions, null, 2));
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

checkRoles(); 