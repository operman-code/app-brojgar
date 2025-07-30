const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: 6
  },
  
  // Business information
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  businessType: {
    type: String,
    enum: ['retail', 'wholesale', 'service', 'manufacturing', 'restaurant', 'other'],
    default: 'retail'
  },
  businessAddress: {
    type: String,
    maxlength: 500
  },
  businessPhone: {
    type: String,
    maxlength: 20
  },
  
  // Google OAuth
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String // URL to profile picture
  },
  
  // App preferences
  preferences: {
    currency: {
      type: String,
      default: 'INR'
    },
    language: {
      type: String,
      default: 'en'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Subscription info (for future use)
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    features: [String]
  },
  
  // Device information for persistent login
  deviceTokens: [{
    token: String,
    deviceId: String,
    deviceName: String,
    platform: String,
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Security
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ 'deviceTokens.deviceId': 1 });

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

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
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
  
  // If we've reached max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to add device token
userSchema.methods.addDeviceToken = function(tokenData) {
  // Remove existing token for same device
  this.deviceTokens = this.deviceTokens.filter(
    device => device.deviceId !== tokenData.deviceId
  );
  
  // Add new token
  this.deviceTokens.push({
    ...tokenData,
    lastUsed: new Date()
  });
  
  // Keep only last 5 devices
  if (this.deviceTokens.length > 5) {
    this.deviceTokens = this.deviceTokens
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 5);
  }
  
  return this.save();
};

// Static method to find by email or Google ID
userSchema.statics.findByEmailOrGoogle = function(email, googleId) {
  const query = { isActive: true };
  
  if (googleId) {
    query.$or = [{ email }, { googleId }];
  } else {
    query.email = email;
  }
  
  return this.findOne(query);
};

// Export the model
module.exports = mongoose.model('User', userSchema);