require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jmartinkovych:Plimbo4321098@cluster0.ufcmh.mongodb.net/ADsun');
    console.log('Connected to MongoDB');

    // Nové heslo
    const newPassword = 'ADsun2024';
    
    // Vytvoriť hash hesla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Aktualizovať používateľa v databáze
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'info@adsun.sk' },
      { $set: { passwordHash: hashedPassword } }
    );
    
    if (result.matchedCount > 0) {
      console.log(`Password reset successful for user with email info@adsun.sk`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log('No user found with email info@adsun.sk');
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

resetAdminPassword(); 