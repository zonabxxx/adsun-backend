const mongoose = require('mongoose');
const logger = require('../../utils/logger');

/**
 * Získanie systémových nastavení
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSystemSettings = async (req, res) => {
  try {
    // Použiť mongoose namiesto priameho prístupu k db.collection
    const settingsCollection = mongoose.connection.collection('settings');
    
    // Hľadáme globálne nastavenia alebo vytvárame nové, ak neexistujú
    let settings = await settingsCollection.findOne({ type: 'global' });
    
    if (!settings) {
      // Ak nastavenia neexistujú, vytvoríme predvolené hodnoty
      const defaultSettings = {
        type: 'global',
        company: {
          name: 'ADsun, s.r.o.',
          logo: '/assets/images/logo.png',
          address: 'Hlavná 123, 945 01 Komárno',
          ico: '12345678',
          dic: '1234567890',
          icdph: 'SK1234567890',
          email: 'info@adsun.sk',
          phone: '+421 123 456 789',
          web: 'www.adsun.sk',
          bankAccount: 'SK1234567890123456789012',
          swift: 'TATRSKBX',
          signature: '/assets/images/signature.png'
        },
        invoices: {
          prefix: 'FA',
          numberingFormat: 'YYYY/nnnn',
          defaultDueDate: 14,
          defaultCurrency: 'EUR',
          vatRate: 20,
          invoiceFooter: 'Ďakujeme za Vašu objednávku.',
          defaultTerms: 'Faktúra je splatná do dátumu splatnosti uvedeného na faktúre.',
          sendAutomatically: true,
          reminderEnabled: true,
          reminderDays: [3, 7, 14]
        },
        orders: {
          prefix: 'OBJ',
          numberingFormat: 'YYYY/nnnn',
          defaultProcessingTime: 3,
          automaticConfirmation: true,
          statusOptions: [
            'Nová',
            'Potvrdená',
            'V procese',
            'Dokončená',
            'Zrušená'
          ],
          notifyOnStatusChange: true
        },
        documents: {
          primaryColor: '#0066cc',
          secondaryColor: '#f8f9fa',
          fontFamily: 'Arial',
          logoPosition: 'top-right',
          showQrCode: true,
          pageSize: 'A4',
          signatureEnabled: true,
          headerText: 'ADsun, s.r.o.',
          footerText: 'www.adsun.sk | info@adsun.sk | +421 123 456 789'
        },
        finances: {
          currencies: ['EUR', 'CZK', 'USD'],
          defaultPaymentMethod: 'bankTransfer',
          paymentMethods: [
            { id: 'cash', name: 'Hotovosť', enabled: true },
            { id: 'bankTransfer', name: 'Bankový prevod', enabled: true },
            { id: 'card', name: 'Platobná karta', enabled: true },
            { id: 'paypal', name: 'PayPal', enabled: false }
          ],
          reportingPeriod: 'monthly',
          defaultTaxSettings: {
            vatPayer: true,
            vatRate: 20
          }
        },
        workflow: {
          stages: [
            { id: 'stage-1', name: 'Cenová ponuka', color: '#17a2b8', categories: [] },
            { id: 'stage-2', name: 'Objednávka', color: '#28a745', categories: [] },
            { id: 'stage-3', name: 'Výroba', color: '#fd7e14', categories: [] },
            { id: 'stage-4', name: 'Expedícia', color: '#007bff', categories: [] },
            { id: 'stage-5', name: 'Fakturácia', color: '#dc3545', categories: [] }
          ],
          automations: [
            { trigger: 'orderConfirmed', action: 'startProduction', enabled: true },
            { trigger: 'productionComplete', action: 'scheduleDelivery', enabled: true },
            { trigger: 'deliveryComplete', action: 'createInvoice', enabled: true }
          ],
          notifyAdmin: true,
          notifyManager: true,
          notifyCustomer: false,
          notificationCc: ''
        },
        products: {
          categories: [
            {
              id: 'largeFormat',
              name: 'Veľkoformátová tlač',
              icon: 'print',
              subcategories: [
                { id: 'banners', name: 'Bannery' },
                { id: 'billboards', name: 'Billboardy' },
                { id: 'posters', name: 'Plagáty' }
              ]
            },
            {
              id: 'smallFormat',
              name: 'Maloformátová tlač',
              icon: 'file',
              subcategories: [
                { id: 'businessCards', name: 'Vizitky' },
                { id: 'flyers', name: 'Letáky' },
                { id: 'brochures', name: 'Brožúry' }
              ]
            },
            {
              id: 'promotional',
              name: 'Reklamné predmety',
              icon: 'gift',
              subcategories: [
                { id: 'tshirts', name: 'Tričká' },
                { id: 'pens', name: 'Perá' },
                { id: 'cups', name: 'Hrnčeky' }
              ]
            }
          ],
          unitOptions: ['ks', 'm2', 'bm', 'bal']
        },
        system: {
          appName: 'ADSUN 2.0',
          maintenanceMode: false,
          debugMode: false,
          itemsPerPage: 15,
          logLevel: 'warning',
          cacheEnabled: true
        },
        security: {
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordExpiration: 90,
          requireStrongPasswords: true,
          enableTwoFactor: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Vložíme predvolené nastavenia do databázy
      await settingsCollection.insertOne(defaultSettings);
      settings = defaultSettings;
    }
    
    // Odstránime technické polia pred odoslaním klientovi
    if (settings._id) {
      delete settings._id;
    }
    
    return res.status(200).json({
      success: true,
      settings: settings
    });
  } catch (error) {
    logger.error(`Error getting system settings: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri získavaní systémových nastavení',
      error: error.message
    });
  }
};

/**
 * Aktualizácia systémových nastavení
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateSystemSettings = async (req, res) => {
  try {
    // Validácia vstupu
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Neplatný formát dát'
      });
    }
    
    // Použiť mongoose namiesto priameho prístupu k db.collection
    const settingsCollection = mongoose.connection.collection('settings');
    
    // Extrakcia dát z požiadavky
    const settingsData = req.body;
    
    // Log dát pred uložením
    logger.info(`Updating system settings, received data: ${JSON.stringify({
      receivedSections: Object.keys(settingsData),
      hasCompanyData: !!settingsData.company
    })}`);
    
    // Podrobné logovanie pre firemné údaje
    if (settingsData.company) {
      const companyData = settingsData.company;
      logger.info(`Company data being updated: ${JSON.stringify({
        name: companyData.name,
        contactCount: companyData.contacts?.length || 0,
        branchCount: companyData.branches?.length || 0,
        bankAccountCount: companyData.bankDetails?.length || 0
      })}`);
      
      // Detailné logovanie zoznamov pre lepšiu diagnostiku
      if (companyData.contacts) {
        logger.info(`Contacts list being updated with ${companyData.contacts.length} items`);
        companyData.contacts.forEach((contact, index) => {
          logger.info(`Contact #${index + 1}: ${contact.name} - ${contact.position}`);
        });
      }
      
      if (companyData.branches) {
        logger.info(`Branches list being updated with ${companyData.branches.length} items`);
        companyData.branches.forEach((branch, index) => {
          logger.info(`Branch #${index + 1}: ${branch.name} - ${branch.address}`);
        });
      }
      
      if (companyData.bankDetails) {
        logger.info(`Bank accounts list being updated with ${companyData.bankDetails.length} items`);
        companyData.bankDetails.forEach((bank, index) => {
          logger.info(`Bank #${index + 1}: ${bank.bankName} - ${bank.iban}`);
        });
      }
    }
    
    // Aktualizácia nastavení v databáze
    const updateResult = await settingsCollection.updateOne(
      { type: 'global' },
      { 
        $set: {
          ...settingsData,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    if (updateResult.matchedCount === 0 && updateResult.upsertedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nastavenia neboli nájdené a nebolo možné ich vytvoriť'
      });
    }
    
    logger.info(`System settings updated by user ${req.user?.username || 'unknown'}, result: ${JSON.stringify({
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      upsertedCount: updateResult.upsertedCount
    })}`);
    
    return res.status(200).json({
      success: true,
      message: 'Systémové nastavenia boli úspešne aktualizované'
    });
  } catch (error) {
    logger.error(`Error updating system settings: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Chyba pri aktualizácii systémových nastavení',
      error: error.message
    });
  }
}; 