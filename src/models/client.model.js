const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schéma pre model Client - záznamy o klientoch a dodávateľoch
 */
const clientSchema = new Schema({
  // Základné informácie
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    // Email nemusí byť unikátny, pretože jedna firma môže mať viacero kontaktov
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Firemné údaje
  company: {
    type: String,
    trim: true
  },
  ico: {
    type: String,
    trim: true,
    index: true
  },
  dic: {
    type: String,
    trim: true
  },
  icdph: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Rozšírené firemné údaje
  companyDetails: {
    legalForm: String,
    registryInfo: String,
    dateEstablished: Date,
    website: String,
    logo: String,
    note: String
  },
  // Banková informácie
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    iban: String,
    swift: String,
    currency: {
      type: String,
      default: 'EUR'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Adresa pre fakturáciu
  billingAddress: {
    street: String,
    city: String,
    zip: String,
    country: {
      type: String,
      default: 'Slovakia'
    },
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  // Adresa pre dodanie
  shippingAddress: {
    street: String,
    city: String,
    zip: String,
    country: {
      type: String,
      default: 'Slovakia'
    },
    isDefault: {
      type: Boolean,
      default: true
    }
  },
  // Typ klienta
  type: {
    type: String,
    enum: ['client', 'supplier', 'both'],
    default: 'client'
  },
  // Kategórie klienta (pre filtrovanie)
  categories: [{
    type: String
  }],
  // Príznak aktívneho klienta
  isActive: {
    type: Boolean,
    default: true
  },
  // História komunikácie
  communication: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'other'],
      default: 'other'
    },
    subject: String,
    content: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Pridružené kontakty
  contacts: [{
    name: String,
    position: String,
    email: String,
    phone: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Firemná značka pre interné účely
  internalTag: String,
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index pre rýchle vyhľadávanie
clientSchema.index({ name: 'text', email: 'text', company: 'text' });

// Pred uložením aktualizujeme updatedAt
clientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Client', clientSchema); 