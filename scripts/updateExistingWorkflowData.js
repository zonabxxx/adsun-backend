/**
 * Skript na aktualizáciu existujúceho workflow záznamu v MongoDB
 */
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

// Prístupové údaje pre MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

// ID existujúceho záznamu
const GLOBAL_RECORD_ID = '67e6a2c52e4ccd9c2517bfdf';

// Hlavná funkcia
async function updateExistingWorkflowData() {
  let client;
  try {
    console.log('Pripájam sa k MongoDB...');
    console.log(`URI: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//[USERNAME]:[PASSWORD]@')}`);
    console.log(`Database: ${MONGODB_DB_NAME}`);
    console.log(`Budem aktualizovať existujúci záznam s ID: ${GLOBAL_RECORD_ID}`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Pripojenie úspešné!');
    
    const db = client.db(MONGODB_DB_NAME);
    
    // 1. Aktualizácia workflow sekcie v existujúcom zázname settings
    await updateExistingSettingsRecord(db);
    
    // 2. Aktualizácia workflow fáz v categories kolekcii
    await updateCategoriesCollection(db);
    
    console.log('Všetky dáta boli úspešne aktualizované!');
  } catch (error) {
    console.error('Chyba:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Pripojenie k MongoDB ukončené');
    }
  }
}

// Aktualizácia existujúceho záznamu v settings kolekcii
async function updateExistingSettingsRecord(db) {
  try {
    const settingsCollection = db.collection('settings');
    
    // Najprv skontrolujeme či existuje záznam s daným ID
    const existingSettings = await settingsCollection.findOne({ _id: new ObjectId(GLOBAL_RECORD_ID) });
    
    if (!existingSettings) {
      console.error(`Záznam s ID ${GLOBAL_RECORD_ID} nebol nájdený!`);
      throw new Error(`Záznam s ID ${GLOBAL_RECORD_ID} nebol nájdený!`);
    }
    
    console.log('Našiel som existujúci záznam:', existingSettings.id);
    
    // Workflow nastavenia - štruktúra pre settings
    const workflowSettings = {
      stages: [
        {
          id: 'stage-cenoveponuky',
          name: 'Cenové ponuky',
          color: '#6c757d',
          workflowModuleId: 'cenoveponuky',
          workflowModule: {
            id: 'cenoveponuky',
            name: 'Cenové ponuky',
            path: '/workflow/quotes',
            icon: 'file-contract',
            order: 1,
            active: true
          },
          categories: []
        },
        {
          id: 'stage-objednavka',
          name: 'Objednávka',
          color: '#0d6efd',
          workflowModuleId: 'objednavka',
          workflowModule: {
            id: 'objednavka',
            name: 'Objednávka',
            path: '/zakazky/objednavka',
            icon: 'file-invoice',
            order: 2,
            active: true
          },
          categories: []
        },
        {
          id: 'stage-zakazka',
          name: 'Zákazka',
          color: '#198754',
          workflowModuleId: 'zakazka',
          workflowModule: {
            id: 'zakazka',
            name: 'Zákazka',
            path: '/zakazky/zakazka',
            icon: 'tasks',
            order: 3,
            active: true
          },
          categories: []
        },
        {
          id: 'stage-expediacia',
          name: 'Expediácia',
          color: '#fd7e14',
          workflowModuleId: 'expediacia',
          workflowModule: {
            id: 'expediacia',
            name: 'Expediácia',
            path: '/zakazky/expediacia',
            icon: 'truck',
            order: 4,
            active: true
          },
          categories: []
        },
        {
          id: 'stage-fakturacia',
          name: 'Fakturácia',
          color: '#dc3545',
          workflowModuleId: 'fakturacia',
          workflowModule: {
            id: 'fakturacia',
            name: 'Fakturácia',
            path: '/zakazky/fakturacia',
            icon: 'file-invoice-dollar',
            order: 5,
            active: true
          },
          categories: []
        }
      ]
    };
    
    // Aktualizácia existujúceho záznamu s konkrétnym ID
    const result = await settingsCollection.updateOne(
      { _id: new ObjectId(GLOBAL_RECORD_ID) },
      { 
        $set: {
          workflow: workflowSettings,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Settings kolekcia aktualizovaná: ${result.modifiedCount} záznamov upravených`);
    
    return result;
  } catch (error) {
    console.error('Chyba pri aktualizácii settings kolekcie:', error);
    throw error;
  }
}

// Aktualizácia categories kolekcie
async function updateCategoriesCollection(db) {
  try {
    const categoriesCollection = db.collection('categories');
    
    // Workflow fázy - štruktúra pre categories
    const workflowPhases = [
      {
        id: 'cenoveponuky',
        name: 'Cenové ponuky',
        path: '/workflow/quotes',
        icon: 'file-contract',
        order: 1,
        active: true,
        color: '#6c757d'
      },
      {
        id: 'objednavka',
        name: 'Objednávka',
        path: '/zakazky/objednavka',
        icon: 'file-invoice',
        order: 2,
        active: true,
        color: '#0d6efd'
      },
      {
        id: 'zakazka',
        name: 'Zákazka',
        path: '/zakazky/zakazka',
        icon: 'tasks',
        order: 3,
        active: true,
        color: '#198754'
      },
      {
        id: 'expediacia',
        name: 'Expediácia',
        path: '/zakazky/expediacia',
        icon: 'truck',
        order: 4,
        active: true,
        color: '#fd7e14'
      },
      {
        id: 'fakturacia',
        name: 'Fakturácia',
        path: '/zakazky/fakturacia',
        icon: 'file-invoice-dollar',
        order: 5,
        active: true,
        color: '#dc3545'
      }
    ];
    
    // Kontrola existencie zákazky kategórie
    const existingZakazky = await categoriesCollection.findOne({ id: 'zakazky' });
    
    if (existingZakazky) {
      console.log('Aktualizujem existujúcu "zakazky" kategóriu...');
      const result = await categoriesCollection.updateOne(
        { id: 'zakazky' },
        { 
          $set: { 
            subcategories: workflowPhases,
            active: true 
          } 
        }
      );
      
      console.log(`Categories kolekcia aktualizovaná: ${result.modifiedCount} záznamov upravených`);
      return result;
    } else {
      console.log('Vytváram novú "zakazky" kategóriu...');
      const result = await categoriesCollection.insertOne({
        id: 'zakazky',
        name: 'Workflow',
        path: '/zakazky',
        icon: 'project-diagram',
        order: 2,
        active: true,
        subcategories: workflowPhases
      });
      
      console.log(`Categories kolekcia: vytvorená nová kategória zakazky s ID ${result.insertedId}`);
      return result;
    }
  } catch (error) {
    console.error('Chyba pri aktualizácii categories kolekcie:', error);
    throw error;
  }
}

// Spustenie skriptu
updateExistingWorkflowData()
  .then(() => {
    console.log('Skript úspešne dokončený');
    process.exit(0);
  })
  .catch(error => {
    console.error('Skript skončil s chybou:', error);
    process.exit(1);
  }); 