const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
  type: {
    type: String,
    default: 'global',
    required: true
  },
  company: {
    name: String,
    logo: String,
    address: String,
    ico: String,
    dic: String,
    icdph: String,
    email: String,
    phone: String,
    web: String,
    bankAccount: String,
    swift: String,
    signature: String,
    contacts: [{
      name: String,
      position: String,
      phone: String,
      email: String
    }],
    bankDetails: [{
      bankName: String,
      accountNumber: String,
      iban: String,
      swift: String,
      currency: String
    }],
    branches: [{
      name: String,
      address: String,
      phone: String,
      email: String
    }],
    legalInfo: {
      companyRegistry: String,
      dateEstablished: String,
      legalForm: String
    }
  },
  invoices: {
    prefix: String,
    numberingFormat: String,
    defaultDueDate: Number,
    defaultCurrency: String,
    vatRate: Number,
    invoiceFooter: String,
    defaultTerms: String,
    sendAutomatically: Boolean,
    reminderEnabled: Boolean,
    reminderDays: [Number]
  },
  orders: {
    prefix: String,
    numberingFormat: String,
    defaultProcessingTime: Number,
    automaticConfirmation: Boolean,
    statusOptions: [String],
    notifyOnStatusChange: Boolean
  },
  documents: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    logoPosition: String,
    showQrCode: Boolean,
    pageSize: String,
    signatureEnabled: Boolean,
    headerText: String,
    footerText: String
  },
  finances: {
    currencies: [String],
    defaultPaymentMethod: String,
    paymentMethods: [{
      id: String,
      name: String,
      enabled: Boolean
    }],
    reportingPeriod: String,
    defaultTaxSettings: {
      vatPayer: Boolean,
      vatRate: Number
    }
  },
  workflow: {
    defaultStageId: Schema.Types.ObjectId,
    allowBackTransitions: Boolean,
    requiredApproval: Boolean,
    notifyOnTransition: Boolean,
    stageCategories: [{
      name: String,
      color: String,
      icon: String
    }]
  },
  products: {
    categories: [{
      id: String,
      name: String,
      icon: String,
      description: String,
      products: [Schema.Types.Mixed],
      subcategories: [{
        id: String,
        name: String,
        icon: String,
        description: String,
        products: [Schema.Types.Mixed],
        subcategories: [{
          id: String,
          name: String,
          icon: String,
          description: String,
          products: [Schema.Types.Mixed]
        }]
      }]
    }],
    unitOptions: [String]
  },
  system: {
    appName: String,
    maintenanceMode: Boolean,
    debugMode: Boolean,
    itemsPerPage: Number,
    logLevel: String,
    cacheEnabled: Boolean
  },
  security: {
    sessionTimeout: Number,
    maxLoginAttempts: Number,
    passwordExpiration: Number,
    requireStrongPasswords: Boolean,
    enableTwoFactor: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema); 