import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import axios from 'axios';

const AuthContext = createContext();

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-api.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@brojgar_token',
  DEVICE_TOKEN: '@brojgar_device_token',
  DEVICE_ID: '@brojgar_device_id',
  USER: '@brojgar_user',
  IS_FIRST_LAUNCH: '@brojgar_first_launch'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [deviceToken, setDeviceToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Generate or get device ID
  const getDeviceId = async () => {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      
      if (!deviceId) {
        // Generate a unique device ID
        deviceId = Crypto.randomUUID();
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return Crypto.randomUUID();
    }
  };

  // Get device info
  const getDeviceInfo = async () => {
    const deviceId = await getDeviceId();
    
    return {
      deviceId,
      deviceName: Device.deviceName || 'Unknown Device',
      platform: Device.osName || 'unknown'
    };
  };

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Save auth data to storage
  const saveAuthData = async (authData) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, authData.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user)),
        authData.deviceToken && AsyncStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, authData.deviceToken)
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // Clear auth data from storage
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER)
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Load saved auth data
  const loadAuthData = async () => {
    try {
      const [savedToken, savedDeviceToken, savedUser, firstLaunch] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_LAUNCH)
      ]);

      setIsFirstLaunch(firstLaunch === null);

      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setDeviceToken(savedDeviceToken);
        setUser(userData);
        setAuthToken(savedToken);
        setIsAuthenticated(true);

        // Try to verify token with server
        await verifyToken();
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      await clearAuthData();
    }
  };

  // Verify token with server
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      await logout();
      return false;
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const deviceInfo = await getDeviceInfo();
      
      const response = await api.post('/auth/register', {
        ...userData,
        deviceInfo
      });

      if (response.data.success) {
        const { token, deviceToken, user } = response.data;
        
        setToken(token);
        setDeviceToken(deviceToken);
        setUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        await saveAuthData(response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LAUNCH, 'false');
        setIsFirstLaunch(false);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const deviceInfo = await getDeviceInfo();
      
      const response = await api.post('/auth/login', {
        email,
        password,
        deviceInfo
      });

      if (response.data.success) {
        const { token, deviceToken, user } = response.data;
        
        setToken(token);
        setDeviceToken(deviceToken);
        setUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        await saveAuthData(response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LAUNCH, 'false');
        setIsFirstLaunch(false);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Google authentication
  const googleAuth = async (idToken) => {
    try {
      setIsLoading(true);
      const deviceInfo = await getDeviceInfo();
      
      const response = await api.post('/auth/google', {
        idToken,
        deviceInfo
      });

      if (response.data.success) {
        const { token, deviceToken, user } = response.data;
        
        setToken(token);
        setDeviceToken(deviceToken);
        setUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        await saveAuthData(response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LAUNCH, 'false');
        setIsFirstLaunch(false);
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      const message = error.response?.data?.message || error.message || 'Google authentication failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify device token (for persistent login)
  const verifyDeviceToken = async () => {
    try {
      if (!deviceToken) return false;
      
      const deviceInfo = await getDeviceInfo();
      
      const response = await api.post('/auth/verify-device', {
        deviceToken,
        deviceId: deviceInfo.deviceId
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        await saveAuthData({ token, user, deviceToken });
        
        return true;
      } else {
        throw new Error('Device verification failed');
      }
    } catch (error) {
      console.error('Device verification error:', error);
      await logout();
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.user);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (token) {
        const deviceInfo = await getDeviceInfo();
        await api.post('/auth/logout', { deviceId: deviceInfo.deviceId });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call success
      setToken(null);
      setDeviceToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      await clearAuthData();
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadAuthData();
        
        // If we have a device token but no regular token, try device verification
        if (deviceToken && !token) {
          await verifyDeviceToken();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    isFirstLaunch,
    
    // Actions
    register,
    login,
    googleAuth,
    logout,
    updateProfile,
    verifyDeviceToken,
    
    // API instance for other parts of the app
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};