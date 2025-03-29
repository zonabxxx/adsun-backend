require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function updateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jmartinkovych:Plimbo4321098@cluster0.ufcmh.mongodb.net/ADsun');
    console.log('Connected to MongoDB');

    // Definované hesla pre používateľov
    const userPasswords = {
      'admin': 'admin123',
      'manager': 'manager123',
      'accountant': 'account123',
      'employee1': 'employee123',
      'employee2': 'employee123'
    };

    // Získať všetkých používateľov
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to update`);

    // Aktualizovať každého používateľa
    for (const user of users) {
      // Vybrať heslo pre daného používateľa alebo použiť predvolené
      const password = userPasswords[user.username] || 'password123';
      
      // Vytvoriť hash hesla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Aktualizovať používateľa v databáze
      const result = await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`Updated user ${user.username} with password ${password}, result: ${result.modifiedCount} document(s) modified`);
    }

    console.log('All users have been updated successfully');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

updateUsers(); 