const mongoose = require('mongoose');

// Super flexible schema - accepts ANY data structure
const assetSchema = new mongoose.Schema({
  // Core fields with defaults
  name: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Asset name cannot exceed 100 characters'],
    default: 'Unnamed Asset'
  },
  assetId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: false,
    enum: ['Electronics', 'Furniture', 'Vehicles', 'Machinery', 'Software', 'Other', 'IT Equipment', 'Office Furniture'],
    default: 'Other'
  },
  status: {
    type: String,
    required: false,
    enum: ['Active', 'Inactive', 'Maintenance', 'Repaired', 'Lost'],
    default: 'Active'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.Mixed, // Accept string or ObjectId
    default: null
  },
  assignedDate: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  history: {
    type: Array,
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Accept ANY additional fields
  [String]: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  strict: false, // Allow any fields not in schema
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
assetSchema.index({ assetId: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ name: 1 });

// Virtual for asset age (placeholder for future use)
assetSchema.virtual('age').get(function() {
  return null; // No purchase date field currently
});

// Virtual for depreciation (placeholder for future use)
assetSchema.virtual('depreciation').get(function() {
  return null; // No price fields currently
});

// Virtual for display name
assetSchema.virtual('displayName').get(function() {
  return this.name || 'Unnamed Asset';
});

// Super flexible pre-save middleware - handles ANY data structure
assetSchema.pre('save', function(next) {
  try {
    // Auto-generate assetId if not provided
    if (!this.assetId) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.assetId = `AST${timestamp}${random}`;
      console.log(`🔧 Auto-generated assetId: ${this.assetId}`);
    } else {
      // Ensure assetId is uppercase
      this.assetId = this.assetId.toUpperCase();
      console.log(`🔧 AssetId normalized to: ${this.assetId}`);
    }

    // Set defaults for optional fields only
    if (!this.name) this.name = 'Unnamed Asset';
    if (!this.category) this.category = 'Other';
    if (!this.status) this.status = 'Active';
    if (!this.description) this.description = '';
    if (!this.history) this.history = [];
    
    // Note: assetId and location are now required fields

    console.log(`🔧 Asset saved with defaults: ${this.name} - ${this.assetId}`);
    next();
  } catch (error) {
    console.error('❌ Error in pre-save middleware:', error);
    next(error);
  }
});

// Instance method to update asset status
assetSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Retired' || newStatus === 'Lost') {
    this.isActive = false;
  }
  return this.save();
};

// Instance method to assign asset to employee
assetSchema.methods.assignToEmployee = function(employeeId) {
  this.assignedTo = employeeId;
  this.assignedDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Asset', assetSchema);
