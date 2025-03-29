const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jmartinkovych:Plimbo4321098@cluster0.ufcmh.mongodb.net/ADsun?retryWrites=true&w=majority';

async function addBackupCategory() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Pridanie novej podkategórie "Zálohy" do kategórie "Administrácia"
    const result = await mongoose.connection.db.collection('categories').updateOne(
      { id: 'admin' },
      { 
        $push: { 
          subcategories: {
            id: 'backups',
            name: 'Zálohy',
            path: '/admin/backups',
            icon: 'database',
            order: 5,
            active: true
          }
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Pridanie práv pre novú podkategóriu do systému
    const permissionUpdateResult = await mongoose.connection.db.collection('roles').updateMany(
      { name: { $in: ['admin', 'superadmin'] } },
      {
        $set: {
          'permissions.admin.backups': {
            read: true,
            write: true
          }
        }
      }
    );
    
    console.log('Permission update result:', permissionUpdateResult);
    
    console.log('Operácia dokončená úspešne');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Spustenie funkcie
addBackupCategory(); 