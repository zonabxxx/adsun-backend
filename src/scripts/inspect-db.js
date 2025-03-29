require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

// Funkcia na preskúmanie obsahu databázy
const inspectDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME
    });
    console.log('MongoDB connected successfully');

    // Získanie zoznamu kolekcií
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== ZOZNAM KOLEKCIÍ ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Detailné informácie o používateľoch
    console.log('\n=== POUŽÍVATELIA ===');
    const users = await User.find({});
    console.log(`Počet používateľov: ${users.length}`);
    
    for (const user of users) {
      console.log('\nUser Details:');
      console.log(`ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`First Name: ${user.firstName || 'N/A'}`);
      console.log(`Last Name: ${user.lastName || 'N/A'}`);
      console.log(`Role: ${user.roleName || 'N/A'}`);
      console.log(`Active: ${user.isActive !== undefined ? user.isActive : 'N/A'}`);
      console.log(`Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`Password: ${user.password ? 'Set' : 'Not set'}`);
      if (user.password) {
        console.log(`Password Hash Length: ${user.password.length}`);
        console.log(`Password Hash: ${user.password.substring(0, 20)}...`);
      }
      
      // Zobrazenie oprávnení
      console.log('Permissions:');
      console.log(JSON.stringify(user.permissions || {}, null, 2));
      console.log('------------------------');
    }
    
    // Preskúmanie iných kolekcií
    for (const collection of collections) {
      if (collection.name !== 'users') {
        console.log(`\n=== KOLEKCIA: ${collection.name.toUpperCase()} ===`);
        const items = await mongoose.connection.db.collection(collection.name).find({}).toArray();
        console.log(`Počet záznamov: ${items.length}`);
        
        if (items.length > 0) {
          console.log('\nVzorové záznamy:');
          for (let i = 0; i < Math.min(3, items.length); i++) {
            console.log(`\nZáznam #${i+1}:`);
            console.log(JSON.stringify(items[i], null, 2));
          }
          
          if (items.length > 3) {
            console.log(`\n... a ďalších ${items.length - 3} záznamov`);
          }
        }
      }
    }
    
    console.log('\nInšpekcia databázy bola úspešne dokončená');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Chyba pri inšpekcii databázy:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

// Spustenie skriptu
inspectDatabase(); 