const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  walletAddress: {
    type: String,
    sparse: true, // Allow null values but ensure uniqueness when present
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        return /^0x[a-fA-F0-9]{40}$/.test(v); // Ethereum address format
      },
      message: 'Please provide a valid Ethereum wallet address'
    }
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // User preferences
  preferences: {
    aiAnalysisEnabled: {
      type: Boolean,
      default: true
    },
    autoEncryptSensitive: {
      type: Boolean,
      default: false
    },
    shareNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },

  // Storage statistics
  storageStats: {
    totalFiles: {
      type: Number,
      default: 0
    },
    totalSize: {
      type: Number,
      default: 0
    },
    totalShared: {
      type: Number,
      default: 0
    },
    lastAnalysisDate: Date
  },

  // API configurations
  apiConfigs: {
    pinata: {
      apiKey: String,
      apiSecret: String,
      gateway: String
    },
    perplexity: {
      apiKey: String
    }
  },

  // Activity tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
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
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

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
  if (!this.password) return false;
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

// Instance method to update storage stats
userSchema.methods.updateStorageStats = function(fileSize, operation = 'add') {
  const update = {
    $inc: {
      'storageStats.totalFiles': operation === 'add' ? 1 : -1,
      'storageStats.totalSize': operation === 'add' ? fileSize : -fileSize
    }
  };
  
  return this.updateOne(update);
};

// Static method to find user by email or wallet address
userSchema.statics.findByEmailOrWallet = function(identifier) {
  const query = validator.isEmail(identifier) 
    ? { email: identifier.toLowerCase() }
    : { walletAddress: identifier };
    
  return this.findOne(query);
};

// Static method to get user stats
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        totalFiles: { $sum: '$storageStats.totalFiles' },
        totalStorage: { $sum: '$storageStats.totalSize' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
