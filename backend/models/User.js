const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false // Optional - user might not be an employee
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee'],
    default: 'Employee',
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'view_assets',
      'create_assets',
      'edit_assets',
      'delete_assets',
      'view_employees',
      'create_employees',
      'edit_employees',
      'delete_employees',
      'view_reports',
      'manage_users',
      'system_settings'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and not already hashed
  if (!this.isModified('password') || this._passwordAlreadyHashed) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, isActive: true });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  // Admin has all permissions
  if (this.role === 'Admin') return true;
  
  // Check if user has specific permission
  return this.permissions.includes(permission);
};

// Instance method to update user role
userSchema.methods.updateRole = function(newRole) {
  this.role = newRole;
  return this.save();
};

// Instance method to add permission
userSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Instance method to remove permission
userSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
