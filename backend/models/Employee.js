const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: false, // Will be auto-generated if not provided
    unique: true,
    trim: true,
    uppercase: true
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty string or null (phone is optional)
        if (!v || v.trim() === '') return true;
        // Check if it's exactly 10 digits
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  subordinates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuedDate: Date,
    expiryDate: Date,
    issuingAuthority: String
  }],
  trainingHistory: [{
    courseName: String,
    completionDate: Date,
    score: Number,
    certificate: String
  }],
  performanceReviews: [{
    reviewDate: Date,
    reviewer: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    goals: [String]
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ manager: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for employment duration
employeeSchema.virtual('employmentDuration').get(function() {
  return Math.floor((Date.now() - this.hireDate) / (1000 * 60 * 60 * 24 * 365.25));
});

// Pre-save middleware to generate employee ID if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Static method to find employees by status
employeeSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isActive: true });
};

// Instance method to update employee status
employeeSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Terminated') {
    this.isActive = false;
  }
  return this.save();
};

// Instance method to add skill
employeeSchema.methods.addSkill = function(skill) {
  if (!this.skills.includes(skill)) {
    this.skills.push(skill);
  }
  return this.save();
};

// Instance method to add performance review
employeeSchema.methods.addPerformanceReview = function(review) {
  this.performanceReviews.push(review);
  return this.save();
};

module.exports = mongoose.model('Employee', employeeSchema);
