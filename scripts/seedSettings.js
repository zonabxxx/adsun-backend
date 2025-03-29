const mongoose = require('mongoose');
const Settings = require('../src/models/settings.model');
const config = require('../src/config/config');

// Pripojenie k MongoDB
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Základné nastavenia
const defaultSettings = {
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
};

// Funkcia pre uloženie nastavení
async function seedSettings() {
  try {
    console.log('Začínam seedovanie nastavení...');
    
    // Kontrola, či už existujú nastavenia
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('Aktualizujem existujúce nastavenia');
      
      // Zachovanie existujúcich údajov pre workflow a produkty
      const updatedSettings = { 
        ...defaultSettings,
        workflow: existingSettings.workflow || {},
        products: existingSettings.products || {},
      };
      
      await Settings.findByIdAndUpdate(existingSettings._id, updatedSettings, { new: true });
      console.log('Nastavenia boli úspešne aktualizované');
    } else {
      console.log('Vytváram nové nastavenia');
      await Settings.create(defaultSettings);
      console.log('Nastavenia boli úspešne vytvorené');
    }
    
    console.log('Seedovanie nastavení bolo úspešne dokončené');
  } catch (error) {
    console.error('Chyba pri seedovaní nastavení:', error);
  } finally {
    // Odpojenie od MongoDB
    mongoose.disconnect();
  }
}

// Spustenie seedovania
seedSettings(); 