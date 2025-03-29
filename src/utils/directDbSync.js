/**
 * Utility pre priamu manipuláciu s MongoDB bez Mongoose
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Funkcia pre priame pripojenie k MongoDB
const getMongoConnection = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adsun';
  const client = new MongoClient(uri);
  await client.connect();
  return client;
};

/**
 * Aktualizácia workflow fáz v categories kolekcii
 * @param {Array} phases Pole fáz, ktoré sa majú uložiť
 * @returns {Object} Výsledok operácie
 */
const updateWorkflowPhases = async (phases) => {
  let client;
  try {
    client = await getMongoConnection();
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    
    // Kontrola, či existuje kategória zakazky
    const zakazky = await categoriesCollection.findOne({ id: 'zakazky' });
    
    if (!zakazky) {
      // Vytvorenie kategórie zakazky, ak neexistuje
      await categoriesCollection.insertOne({
        id: 'zakazky',
        name: 'Zákazky',
        path: '/zakazky',
        icon: 'shopping-cart',
        order: 1,
        active: true,
        subcategories: []
      });
      console.log('Created zakazky category');
    }
    
    // Pripravenie subcategories z fáz
    const subcategories = phases.map((phase, index) => {
      // Vytvorenie ID z názvu - odstránenie diakritiky a medzier, malé písmená
      const normalizedName = phase.name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9]/g, ""); // Remove non-alphanumeric
      
      // Určíme cestu pre položku - špeciálne prípady podľa normalizovaného názvu
      let path = `/zakazky/${normalizedName}`;
      
      // Nastavenie špeciálnych ciest pre konkrétne položky
      if (normalizedName === 'cenoveponuky') {
        path = '/workflow/quotes';
        console.log(`Špeciálna cesta pre "${phase.name}": ${path}`);
      }
      
      // Výpis informácií o ukladanej položke
      console.log(`Fáza "${phase.name}" (ID: ${normalizedName}) bude uložená s cestou: ${path}`);
      
      return {
        id: normalizedName, // Use normalized name as ID
        name: phase.name,
        path: path,
        icon: phase.icon || 'file-invoice',
        order: phase.order || index + 1,
        active: typeof phase.active === 'boolean' ? phase.active : true,
        color: phase.color || '#6c757d'
      };
    });
    
    // Aktualizácia subcategories - nahradíme celé pole
    const result = await categoriesCollection.updateOne(
      { id: 'zakazky' },
      { $set: { subcategories } }
    );
    
    return {
      success: true,
      message: 'Workflow phases updated successfully',
      result
    };
  } catch (error) {
    console.error('Error updating workflow phases:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

/**
 * Získa workflow fázy z kategórie zakazky
 * @returns {Array} Pole workflow fáz
 */
const getWorkflowPhases = async () => {
  let client;
  try {
    client = await getMongoConnection();
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    
    // Získanie workflow fáz z kategórie zakazky
    const zakazkyCategory = await categoriesCollection.findOne({ id: 'zakazky' });
    
    if (!zakazkyCategory || !zakazkyCategory.subcategories) {
      console.log('Nenašli sa žiadne workflow fázy v kategórii zakazky');
      return [];
    }
    
    return zakazkyCategory.subcategories;
  } catch (error) {
    console.error('Chyba pri získavaní workflow fáz:', error);
    return [];
  } finally {
    if (client) {
      await client.close();
    }
  }
};

/**
 * Aktualizuje permission template pre zakazky, pridá príslušné roles
 * @returns {Object} Result object with status
 */
const updateZakazkyPermissionTemplate = async () => {
  let client;
  try {
    client = await getMongoConnection();
    const db = client.db();

    // Získanie workflow fáz
    const workflowPhases = await getWorkflowPhases();
    const validPhases = workflowPhases.filter(phase => phase && phase.id);
    console.log(`Nájdených ${validPhases.length} platných workflow fáz`);

    // Štandardné role, ktoré pridáme ku každému template
    const standardChildren = [
      {
        id: "zakazky.read",
        name: "Prezeranie workflow",
        description: "Umožňuje vidieť zákazky v systéme"
      },
      {
        id: "zakazky.write",
        name: "Úprava workflow",
        description: "Umožňuje upravovať zákazky v systéme"
      },
      {
        id: "zakazky.delete",
        name: "Mazanie workflow",
        description: "Umožňuje mazať zákazky v systéme"
      },
      {
        id: "cenovaponuka.read",
        name: "Prezeranie cenových ponúk",
        description: "Umožňuje vidieť cenové ponuky v systéme"
      },
      {
        id: "cenovaponuka.write",
        name: "Tvorba cenových ponúk",
        description: "Umožňuje vytvárať a upravovať cenové ponuky v systéme"
      },
      {
        id: "cenovaponuka.delete",
        name: "Mazanie cenových ponúk",
        description: "Umožňuje mazať cenové ponuky v systéme"
      },
      {
        id: "quotes.read",
        name: "Prezeranie zoznamu ponúk",
        description: "Umožňuje vidieť zoznam cenových ponúk v systéme"
      },
      {
        id: "quotes.write",
        name: "Úprava cenových ponúk",
        description: "Umožňuje upravovať existujúce cenové ponuky v systéme"
      },
      {
        id: "quotes.delete",
        name: "Mazanie cenových ponúk",
        description: "Umožňuje mazať cenové ponuky zo zoznamu v systéme"
      }
    ];

    // Pre každú workflow fázu vytvoríme permission role
    const workflowChildren = validPhases.map(phase => ({
      id: `${phase.id}.read`,
      name: `${phase.name} - prezeranie`,
      description: `Umožňuje vidieť zákazky vo fáze ${phase.name}`
    })).concat(
      validPhases.map(phase => ({
        id: `${phase.id}.write`,
        name: `${phase.name} - úprava`,
        description: `Umožňuje upravovať zákazky vo fáze ${phase.name}`
      }))
    ).concat(
      validPhases.map(phase => ({
        id: `${phase.id}.delete`,
        name: `${phase.name} - mazanie`,
        description: `Umožňuje mazať zákazky vo fáze ${phase.name}`
      }))
    );

    // Spojíme štandardné role s workflow rolami
    const allChildrenIds = [...standardChildren, ...workflowChildren].map(child => child.id);
    // Odstránime duplikáty (ak by náhodou v standardChildren boli niektoré fázy)
    const uniqueChildren = [...standardChildren, ...workflowChildren].filter(
      (child, index, self) => index === self.findIndex(c => c.id === child.id)
    );

    console.log(`Pripravených ${standardChildren.length} štandardných rolí a ${workflowChildren.length} rolí pre workflow fázy`);

    // Kontrola, či permission template existuje
    const permissionTemplatesCollection = db.collection('permissionTemplates');
    const existingTemplate = await permissionTemplatesCollection.findOne({ id: 'zakazky' });

    if (existingTemplate) {
      // Aktualizujeme existujúci template
      const result = await permissionTemplatesCollection.updateOne(
        { id: 'zakazky' },
        {
          $set: {
            children: uniqueChildren,
            childrenIds: allChildrenIds
          }
        }
      );

      console.log(`Permission template 'zakazky' aktualizovaný s ${uniqueChildren.length} rolami`);
      return {
        success: true,
        message: 'Permission template zakazky aktualizovaný',
        result
      };
    } else {
      // Vytvoríme nový template
      const newTemplate = {
        id: 'zakazky',
        name: 'Workflow & Zákazky',
        description: 'Oprávnenia pre prácu so zákazkami a workflow',
        children: uniqueChildren,
        childrenIds: allChildrenIds
      };

      const result = await permissionTemplatesCollection.insertOne(newTemplate);

      console.log(`Vytvorený nový permission template 'zakazky' s ${uniqueChildren.length} rolami`);
      return {
        success: true,
        message: 'Vytvorený nový permission template zakazky',
        result
      };
    }
  } catch (error) {
    console.error('Chyba pri aktualizácii permission template pre zakazky:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

/**
 * Vytvorenie alebo aktualizácia hlavnej menu kategórie pre Workflow
 * @returns {Object} Výsledok operácie
 */
const createWorkflowMainCategory = async () => {
  let client;
  try {
    client = await getMongoConnection();
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    
    // Získanie existujúcich workflow fáz
    const existingZakazky = await categoriesCollection.findOne({ id: 'zakazky' });
    let subcategories = [];
    
    // Ak už existujú subcategories, zachováme ich
    if (existingZakazky && existingZakazky.subcategories && existingZakazky.subcategories.length > 0) {
      subcategories = existingZakazky.subcategories;
      console.log(`Zachovaných ${subcategories.length} existujúcich workflow fáz`);
    }
    
    // Pridáme novú podkategóriu pre cenové ponuky, ak ešte neexistuje
    const hasCenovaPonukaModule = subcategories.some(sub => sub.id === 'cenovaponuka');
    const hasQuotesModule = subcategories.some(sub => sub.id === 'quotes');
    
    if (!hasCenovaPonukaModule) {
      subcategories.push({
        id: 'cenovaponuka',
        name: 'Cenové ponuky - Nové',
        path: '/workflow/inquiry-quote',
        icon: 'file-invoice-dollar',
        order: subcategories.length + 1,
        active: true
      });
      console.log('Pridaný modul cenovej ponuky - Nový');
    }
    
    if (!hasQuotesModule) {
      subcategories.push({
        id: 'quotes',
        name: 'Cenové ponuky - Zoznam',
        path: '/workflow/quotes',
        icon: 'list-alt',
        order: subcategories.length + 1,
        active: true
      });
      console.log('Pridaný modul Zoznam cenových ponúk');
    }
    
    // Kontrola, či workflow kategória už existuje ako top-level kategória
    const existingMainCategory = await categoriesCollection.findOne({ 
      id: 'zakazky', 
      parentId: { $exists: false }  // Hľadáme len hlavné kategórie (bez rodiča)
    });
    
    if (existingMainCategory) {
      // Aktualizácia existujúcej kategórie
      const updateResult = await categoriesCollection.updateOne(
        { id: 'zakazky', parentId: { $exists: false } },
        { 
          $set: { 
            subcategories,
            active: true
          } 
        }
      );
      
      console.log(`Aktualizovaný workflow main category s ${subcategories.length} podkategóriami`);
      return {
        success: true,
        message: 'Workflow kategória bola úspešne aktualizovaná',
        result: updateResult
      };
    } else {
      // Vytvorenie novej kategórie
      const newCategory = {
        id: 'zakazky',
        name: 'Workflow',
        icon: 'tasks',
        order: 5, // Pozícia v menu
        active: true,
        subcategories
      };
      
      const insertResult = await categoriesCollection.insertOne(newCategory);
      
      console.log(`Vytvorená nová workflow main category s ${subcategories.length} podkategóriami`);
      return {
        success: true,
        message: 'Workflow kategória bola úspešne vytvorená',
        result: insertResult
      };
    }
  } catch (error) {
    console.error('Chyba pri vytváraní/aktualizácii workflow kategórie:', error);
    return {
      success: false,
      message: 'Chyba pri vytváraní/aktualizácii workflow kategórie',
      error: error.message
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = {
  updateWorkflowPhases,
  getWorkflowPhases,
  updateZakazkyPermissionTemplate,
  createWorkflowMainCategory
}; 