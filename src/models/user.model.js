const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  roleName: {
    type: String,
    required: true,
    default: 'user'
  },
  permissions: {
    type: Object,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  isSystem: Boolean,
  roleId: mongoose.Schema.Types.ObjectId,
  // Používateľské preferencie ako téma, jazyk atď.
  preferences: {
    type: Object,
    default: {
      theme: 'light',
      language: 'sk',
      notifications: {
        email: true,
        browser: true
      }
    }
  },
  // Nastavenia emailového servera pre odosielanie emailov
  emailServer: {
    type: Object,
    default: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromAddress: '',
      fromName: '',
      replyTo: '',
      signature: '',
      enableAuth: true
    }
  }
}, {
  timestamps: true
});

// Virtual property for password (setter only)
userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    // Nastavíme passwordHash priamo, ak ešte nie je nastavený (nový používateľ)
    if (!this.passwordHash && password) {
      const salt = bcrypt.genSaltSync(10);
      this.passwordHash = bcrypt.hashSync(password, salt);
    }
  });

// Pre-save middleware to hash password (pre update operations)
userSchema.pre('save', async function(next) {
  if (this._password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this._password, salt);
      // Delete the temporary password field
      delete this._password;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw error;
  }
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 