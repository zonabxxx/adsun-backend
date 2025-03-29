const { MongoClient } = require('mongodb');
require('dotenv').config();
const logger = require('../utils/logger');

// Funkcia pre priame pripojenie k MongoDB
const getMongoConnection = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adsun';
  const client = new MongoClient(uri);
  await client.connect();
  return client;
};

/**
 * Získa všetky workflow moduly
 */
exports.getWorkflowModules = async (req, res) => {
  let client;
  try {
    client = await getMongoConnection();
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    const category = await categoriesCollection.findOne({ id: 'zakazky' });
    
    if (!category || !category.subcategories) {
      return res.status(200).json([]);
    }
    
    // Transformácia podkategórií na workflow moduly
    const workflowModules = category.subcategories
      .filter(subcat => subcat.active !== false)
      .map(subcat => ({
        id: subcat.id,
        name: subcat.name,
        path: subcat.path || `/workflow/${subcat.id}`,
        icon: subcat.icon || 'box',
        order: subcat.order || 0
      }))
      .sort((a, b) => a.order - b.order);
    
    return res.status(200).json(workflowModules);
  } catch (error) {
    logger.error('Chyba pri získavaní workflow modulov:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať workflow moduly', error: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

/**
 * Získa posledné e-maily súvisiace s workflow
 */
exports.getRecentEmails = async (req, res) => {
  try {
    // Toto by malo byť nahradené skutočným získaním dát z databázy
    // Pre demonštračné účely vraciam mockované dáta
    const mockEmails = [
      { id: 1, subject: 'Dopyt - reklamné bannery', sender: 'client@example.com', senderName: 'Potenciálny klient', date: new Date('2023-07-01T10:30:00Z'), isRead: false },
      { id: 2, subject: 'Cenová ponuka - tlačoviny', sender: 'info@firma.sk', senderName: 'Firma s.r.o.', date: new Date('2023-06-30T08:15:00Z'), isRead: true },
      { id: 3, subject: 'Objednávka materiálu', sender: 'dodavatel@material.sk', senderName: 'Dodávateľ materiálu', date: new Date('2023-06-29T14:45:00Z'), isRead: true }
    ];
    
    return res.status(200).json(mockEmails);
  } catch (error) {
    logger.error('Chyba pri získavaní posledných e-mailov:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať posledné e-maily', error: error.message });
  }
};

/**
 * Získa posledné cenové ponuky
 */
exports.getRecentQuotes = async (req, res) => {
  try {
    // Toto by malo byť nahradené skutočným získaním dát z databázy
    // Pre demonštračné účely vraciam mockované dáta
    const mockQuotes = [
      { id: 101, title: 'CP-2023-101 - Reklamné bannery', client: 'Firma s.r.o.', date: new Date('2023-06-28T11:20:00Z'), status: 'sent', amount: 450.80 },
      { id: 102, title: 'CP-2023-102 - Vizitky a hlavičkové papiere', client: 'Klient a.s.', date: new Date('2023-06-25T16:00:00Z'), status: 'accepted', amount: 120.50 },
      { id: 103, title: 'CP-2023-103 - Promo materiály', client: 'Zákazník s.r.o.', date: new Date('2023-06-20T09:30:00Z'), status: 'draft', amount: 785.00 }
    ];
    
    return res.status(200).json(mockQuotes);
  } catch (error) {
    logger.error('Chyba pri získavaní posledných cenových ponúk:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať posledné cenové ponuky', error: error.message });
  }
};

/**
 * Získa maily v priečinku inbox
 */
exports.getInboxEmails = async (req, res) => {
  try {
    // Toto by malo byť nahradené skutočným získaním dát z databázy
    // Pre demonštračné účely vraciam mockované dáta
    const mockInboxEmails = [
      { 
        id: 201, 
        subject: 'Dopyt na bannery pre event', 
        sender: 'klient@firma.sk', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-29T10:00:00Z'), 
        body: 'Dobrý deň,\n\nMáme záujem o výrobu 5 bannerov pre náš firemný event.\nRozmery: 2x1m\nFarba: plnofarebná\nMateriál: PVC\n\nProsím o cenovú ponuku.\n\nS pozdravom,\nJan Novák\nFirma s.r.o.',
        read: false,
        attachments: []
      },
      { 
        id: 202, 
        subject: 'Záujem o výrobu letákov', 
        sender: 'marketing@zakaznik.com', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-28T14:25:00Z'), 
        body: 'Dobrý deň,\n\nChceli by sme si u Vás objednať výrobu letákov pre náš nový produkt.\nMnožstvo: 1000 ks\nFormát: A5\nPapier: 135g lesklý\nTlač: obojstranná, plnofarebná\n\nProsím o cenovú ponuku a termín dodania.\n\nĎakujem,\nMária Kováčová\nMarketingový manažér',
        read: true,
        attachments: []
      },
      { 
        id: 203, 
        subject: 'Dopyt - firemné vizitky', 
        sender: 'sekretariat@klient.sk', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-27T09:12:00Z'), 
        body: 'Dobrý deň,\n\nPotrebujeme vyrobiť firemné vizitky pre nových zamestnancov.\nPočet: 10 osôb, po 100ks\nRozmery: štandardné 90x50mm\nMateriál: 300g matný\nTlač: obojstranná s parciálnym lakom na logu\n\nProsím pošlite nám cenovú ponuku.\n\nĎakujem\nPeter Horváth',
        read: false,
        attachments: []
      }
    ];
    
    return res.status(200).json(mockInboxEmails);
  } catch (error) {
    logger.error('Chyba pri získavaní emailov z inbox priečinku:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať emaily', error: error.message });
  }
};

/**
 * Získa odoslané maily
 */
exports.getSentEmails = async (req, res) => {
  try {
    // Toto by malo byť nahradené skutočným získaním dát z databázy
    // Pre demonštračné účely vraciam mockované dáta
    const mockSentEmails = [
      { 
        id: 301, 
        subject: 'RE: Dopyt na bannery pre event', 
        sender: 'info@vasa-firma.sk',
        recipient: 'klient@firma.sk', 
        date: new Date('2023-06-29T11:30:00Z'), 
        body: 'Dobrý deň,\n\nĎakujeme za Váš dopyt. Na základe Vašich požiadaviek posielam cenovú ponuku na výrobu 5 bannerov.\n\nCena: 45€/ks, celkom 225€ bez DPH\nTermín dodania: do 5 pracovných dní\n\nV prípade záujmu alebo dodatočných otázok ma neváhajte kontaktovať.\n\nS pozdravom\nJana Veselá\nObchodné oddelenie',
        read: true,
        attachments: ['Cenová ponuka - Bannery.pdf']
      },
      { 
        id: 302, 
        subject: 'Cenová ponuka - firemné kalendáre', 
        sender: 'info@vasa-firma.sk',
        recipient: 'objednavky@company.com', 
        date: new Date('2023-06-26T15:40:00Z'), 
        body: 'Vážený klient,\n\nNa základe Vašej požiadavky Vám zasielame cenovú ponuku na výrobu firemných kalendárov.\n\nTyp: Nástenný kalendár\nFormát: A3\nPočet: 100ks\nCena: 8,50€/ks, celkom 850€ bez DPH\nTermín: 10-15 pracovných dní\n\nV prílohe nájdete podrobnú ponuku. V prípade otázok ma kontaktujte.\n\nS pozdravom,\nJán Hlavný\nObchodný zástupca',
        read: true,
        attachments: ['CP-2023-104-Firemné-kalendáre.pdf']
      }
    ];
    
    return res.status(200).json(mockSentEmails);
  } catch (error) {
    logger.error('Chyba pri získavaní odoslaných emailov:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať odoslané emaily', error: error.message });
  }
};

/**
 * Získa kategórie produktov
 */
exports.getProductCategories = async (req, res) => {
  try {
    // Mock data pre demonštračné účely
    const mockCategories = [
      {
        id: 1,
        name: 'Tlač',
        subcategories: [
          {
            id: 11,
            name: 'Letáky',
            subcategories: []
          },
          {
            id: 12,
            name: 'Vizitky',
            subcategories: []
          },
          {
            id: 13,
            name: 'Brožúry',
            subcategories: []
          }
        ]
      },
      {
        id: 2,
        name: 'Reklamné predmety',
        subcategories: [
          {
            id: 21,
            name: 'Perá',
            subcategories: []
          },
          {
            id: 22,
            name: 'Hrnčeky',
            subcategories: []
          },
          {
            id: 23,
            name: 'Textil',
            subcategories: []
          }
        ]
      },
      {
        id: 3,
        name: 'Veľkoformát',
        subcategories: [
          {
            id: 31,
            name: 'Bannery',
            subcategories: []
          },
          {
            id: 32,
            name: 'Roll-upy',
            subcategories: []
          },
          {
            id: 33,
            name: 'Plagáty',
            subcategories: []
          }
        ]
      }
    ];
    
    return res.status(200).json(mockCategories);
  } catch (error) {
    logger.error('Chyba pri získavaní kategórií produktov:', error);
    return res.status(500).json({ message: 'Nepodarilo sa získať kategórie produktov', error: error.message });
  }
};

/**
 * Získa produkty pre danú kategóriu
 */
exports.getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  
  try {
    // Mock data pre demonštračné účely
    const mockProductsMap = {
      // Letáky
      '11': [
        { id: 111, name: 'Leták A5 jednostranný 135g', price: 0.15, unit: 'ks' },
        { id: 112, name: 'Leták A5 obojstranný 135g', price: 0.25, unit: 'ks' },
        { id: 113, name: 'Leták A4 jednostranný 135g', price: 0.30, unit: 'ks' }
      ],
      // Vizitky
      '12': [
        { id: 121, name: 'Vizitka štandardná 90x50mm 300g', price: 0.10, unit: 'ks' },
        { id: 122, name: 'Vizitka s parciálnym lakom', price: 0.15, unit: 'ks' },
        { id: 123, name: 'Vizitka so zaoblenými rohmi', price: 0.12, unit: 'ks' }
      ],
      // Bannery
      '31': [
        { id: 311, name: 'Banner PVC 510g 1x1m', price: 25, unit: 'ks' },
        { id: 312, name: 'Banner PVC 510g 2x1m', price: 45, unit: 'ks' },
        { id: 313, name: 'Banner mesh 1x1m', price: 30, unit: 'ks' }
      ]
    };
    
    // Ak existujú produkty pre danú kategóriu, vrátime ich
    if (mockProductsMap[categoryId]) {
      return res.status(200).json(mockProductsMap[categoryId]);
    }
    
    // Ak nie sú produkty pre danú kategóriu, vrátime prázdne pole
    return res.status(200).json([]);
  } catch (error) {
    logger.error(`Chyba pri získavaní produktov pre kategóriu ${categoryId}:`, error);
    return res.status(500).json({ message: 'Nepodarilo sa získať produkty', error: error.message });
  }
};

/**
 * Vytvorí novú cenovú ponuku
 */
exports.createQuote = async (req, res) => {
  try {
    const quoteData = req.body;
    
    // Tu by sa v reálnom systéme uložili dáta do databázy
    // Pre demonštračné účely len vrátime úspech
    
    return res.status(201).json({ 
      success: true, 
      message: 'Cenová ponuka bola úspešne vytvorená',
      quoteId: Date.now() // Simulujeme ID vygenerované databázou
    });
  } catch (error) {
    logger.error('Chyba pri vytváraní cenovej ponuky:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Nepodarilo sa vytvoriť cenovú ponuku', 
      error: error.message 
    });
  }
};

/**
 * Označí email ako spracovaný
 */
exports.markEmailAsProcessed = async (req, res) => {
  const { emailId } = req.params;
  
  try {
    // Tu by sa v reálnom systéme aktualizoval status emailu v databáze
    // Pre demonštračné účely len vrátime úspech
    
    return res.status(200).json({
      success: true,
      message: 'Email bol označený ako spracovaný'
    });
  } catch (error) {
    logger.error(`Chyba pri označovaní emailu ${emailId} ako spracovaný:`, error);
    return res.status(500).json({
      success: false,
      message: 'Nepodarilo sa označiť email ako spracovaný',
      error: error.message
    });
  }
};

/**
 * Získa email podľa ID
 * @param {string} emailId - ID emailu
 * @returns {Promise<Object|null>} - Email objekt alebo null
 */
exports.getEmailById = async (emailId) => {
  try {
    // V reálnej implementácii by tu bolo hľadanie v databáze
    // Pre potreby ukážky vraciam mock email
    
    // Kontrola, či ID je číslo - za id považujeme zatiaľ index v poli mock dát
    const id = parseInt(emailId, 10);
    
    if (isNaN(id)) {
      return null;
    }
    
    // Mock emails pre testovanie
    const mockEmails = [
      { 
        id: 201, 
        subject: 'Dopyt na bannery pre event', 
        sender: 'klient@firma.sk', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-29T10:00:00Z'), 
        body: 'Dobrý deň,\n\nMáme záujem o výrobu 5 bannerov pre náš firemný event.\nRozmery: 2x1m\nFarba: plnofarebná\nMateriál: PVC\n\nProsím o cenovú ponuku.\n\nS pozdravom,\nJan Novák\nFirma s.r.o.\nIČO: 12345678\nTel: +421 900 123 456',
        read: false,
        attachments: []
      },
      { 
        id: 202, 
        subject: 'Záujem o výrobu letákov', 
        sender: 'marketing@zakaznik.com', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-28T14:25:00Z'), 
        body: 'Dobrý deň,\n\nChceli by sme si u Vás objednať výrobu letákov pre náš nový produkt.\nMnožstvo: 1000 ks\nFormát: A5\nPapier: 135g lesklý\nTlač: obojstranná, plnofarebná\n\nProsím o cenovú ponuku a termín dodania.\n\nĎakujem,\nMária Kováčová\nMarketingový manažér\nZakaznik s.r.o.\nUlica: Hlavná 123, 81102 Bratislava\nIČO: 87654321\nDIČ: 2023456789\nTel: +421 911 222 333',
        read: true,
        attachments: []
      },
      { 
        id: 203, 
        subject: 'Dopyt - firemné vizitky', 
        sender: 'sekretariat@klient.sk', 
        recipient: 'info@vasa-firma.sk',
        date: new Date('2023-06-27T09:12:00Z'), 
        body: 'Dobrý deň,\n\nPotrebujeme vyrobiť firemné vizitky pre nových zamestnancov.\nPočet: 10 osôb, po 100ks\nRozmery: štandardné 90x50mm\nMateriál: 300g matný\nTlač: obojstranná s parciálnym lakom na logu\n\nProsím pošlite nám cenovú ponuku.\n\nĎakujem\nPeter Horváth\nKlient a.s.\nIČ DPH: SK2023987654',
        read: false,
        attachments: []
      }
    ];
    
    // Nájdenie emailu podľa ID
    const email = mockEmails.find(e => e.id === id);
    
    return email || null;
  } catch (error) {
    logger.error(`Chyba pri získavaní emailu s ID ${emailId}:`, error);
    return null;
  }
}; 