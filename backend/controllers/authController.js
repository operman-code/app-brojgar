const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Generate device token
const generateDeviceToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send response with token
const sendTokenResponse = (user, statusCode, res, deviceInfo = null) => {
  const token = generateToken(user._id);
  const deviceToken = deviceInfo ? generateDeviceToken() : null;
  
  // Remove password from output
  user.password = undefined;
  
  const response = {
    success: true,
    token,
    deviceToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      businessType: user.businessType,
      avatar: user.avatar,
      preferences: user.preferences,
      subscription: user.subscription,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  };
  
  res.status(statusCode).json(response);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      deviceInfo
    } = req.body;

    // Validation
    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and business name'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      businessName: businessName.trim(),
      businessType: businessType || 'retail',
      businessAddress: businessAddress?.trim(),
      businessPhone: businessPhone?.trim(),
      lastLogin: new Date()
    });

    // Add device token if provided
    if (deviceInfo) {
      const deviceToken = generateDeviceToken();
      await user.addDeviceToken({
        token: deviceToken,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || 'Unknown Device',
        platform: deviceInfo.platform || 'unknown'
      });
    }

    sendTokenResponse(user, 201, res, deviceInfo);

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Add device token if provided
    if (deviceInfo) {
      const deviceToken = generateDeviceToken();
      await user.addDeviceToken({
        token: deviceToken,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || 'Unknown Device',
        platform: deviceInfo.platform || 'unknown'
      });
    }

    sendTokenResponse(user, 200, res, deviceInfo);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, deviceInfo } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find existing user
    let user = await User.findByEmailOrGoogle(email, googleId);

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        googleId: googleId,
        avatar: picture,
        businessName: `${name}'s Business`, // Default business name
        businessType: 'retail',
        isVerified: true, // Google users are pre-verified
        lastLogin: new Date()
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Add device token if provided
    if (deviceInfo) {
      const deviceToken = generateDeviceToken();
      await user.addDeviceToken({
        token: deviceToken,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || 'Unknown Device',
        platform: deviceInfo.platform || 'unknown'
      });
    }

    sendTokenResponse(user, 200, res, deviceInfo);

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
};

// @desc    Verify device token
// @route   POST /api/auth/verify-device
// @access  Public
exports.verifyDeviceToken = async (req, res) => {
  try {
    const { deviceToken, deviceId } = req.body;

    if (!deviceToken || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device token and device ID are required'
      });
    }

    // Find user by device token
    const user = await User.findOne({
      'deviceTokens.token': deviceToken,
      'deviceTokens.deviceId': deviceId,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid device token'
      });
    }

    // Update device last used
    const deviceIndex = user.deviceTokens.findIndex(
      device => device.token === deviceToken && device.deviceId === deviceId
    );

    if (deviceIndex !== -1) {
      user.deviceTokens[deviceIndex].lastUsed = new Date();
      await user.save();
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Device verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Device verification failed'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        businessAddress: user.businessAddress,
        businessPhone: user.businessPhone,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      preferences
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (businessName) user.businessName = businessName.trim();
    if (businessType) user.businessType = businessType;
    if (businessAddress) user.businessAddress = businessAddress.trim();
    if (businessPhone) user.businessPhone = businessPhone.trim();
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        businessAddress: user.businessAddress,
        businessPhone: user.businessPhone,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user (remove device token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (deviceId) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.deviceTokens = user.deviceTokens.filter(
          device => device.deviceId !== deviceId
        );
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};