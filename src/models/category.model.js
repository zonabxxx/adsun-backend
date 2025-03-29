const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'folder'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Static method to get category with subcategories
categorySchema.statics.getWithSubcategories = async function(filter = {}) {
  return this.find(filter)
    .where('parent').equals(null)
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      options: { sort: { order: 1 } }
    })
    .sort('order')
    .exec();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 