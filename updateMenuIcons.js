const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jmartinkovych:Plimbo4321098@cluster0.ufcmh.mongodb.net/ADsun?retryWrites=true&w=majority';

async function updateMenuIcons() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Aktualizácia ikon pre kategórie a podkategórie
    const updates = [
      // 1. Aktualizácia ikonky pre zálohy (už sme pridali database ikonu, ale možno chceme lepšiu)
      {
        category: 'admin',
        subcategory: 'backups',
        newIcon: 'save', // Vhodnejšia ikona pre zálohovanie
        name: 'Zálohovanie' // Aktualizovaný názov na "Zálohovanie" miesto "Zálohy"
      },
      // 2. Logy - zmeniť ikonu
      {
        category: 'admin',
        subcategory: 'logs',
        newIcon: 'history', // História/logy
        name: null // null znamená, že názov sa nemení
      },
      // 3. Nastavenie práv - zmeniť ikonu
      {
        category: 'admin',
        subcategory: 'permissions',
        newIcon: 'lock', // Zámok lepšie reprezentuje práva
        name: null
      },
      // 4. Role - zmeniť ikonu
      {
        category: 'admin',
        subcategory: 'roles',
        newIcon: 'id-badge', // Lepšia reprezentácia rolí
        name: null
      },
      // 5. Používatelia - zmeniť ikonu
      {
        category: 'admin',
        subcategory: 'users',
        newIcon: 'user-cog', // Jednotné (používateľ + nastavenia)
        name: null
      },
      // 6. Dashboard - prehľad
      {
        category: 'dashboard',
        subcategory: 'overview',
        newIcon: 'th-large', // Lepší vizuál pre prehľad
        name: null
      }
    ];
    
    let totalUpdated = 0;
    
    // Vykonať všetky aktualizácie
    for (const update of updates) {
      const updateQuery = { id: update.category, 'subcategories.id': update.subcategory };
      
      const updateData = { $set: {} };
      updateData.$set['subcategories.$.icon'] = update.newIcon;
      
      // Ak sa mení aj názov
      if (update.name) {
        updateData.$set['subcategories.$.name'] = update.name;
      }
      
      const result = await mongoose.connection.db.collection('categories').updateOne(
        updateQuery,
        updateData
      );
      
      console.log(`Update for ${update.category} > ${update.subcategory}:`, result);
      if (result.modifiedCount > 0) {
        totalUpdated += 1;
        console.log(`✅ Ikona pre "${update.category} > ${update.subcategory}" bola aktualizovaná na "${update.newIcon}"`);
        if (update.name) {
          console.log(`   Názov bol aktualizovaný na: "${update.name}"`);
        }
      } else {
        console.log(`❌ Aktualizácia ikony pre "${update.category} > ${update.subcategory}" zlyhala`);
      }
    }
    
    console.log(`\nAktualizácia dokončená. Celkovo aktualizovaných položiek: ${totalUpdated} z ${updates.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Spustenie funkcie
updateMenuIcons(); 