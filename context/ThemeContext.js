// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Light theme colors
const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#9ca3af',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  shadow: '#000',
  statusBar: 'dark',
};

// Dark theme colors
const darkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  primary: '#3b82f6',
  primaryLight: '#1e40af',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',
  border: '#334155',
  borderLight: '#475569',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  shadow: '#000',
  statusBar: 'light',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);
  
  const loadThemePreference = async () => {
    try {
      // For now, just use light theme by default
      // You can add SettingsService integration later
      setIsDarkMode(false);
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsDarkMode(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Save to settings later when SettingsService is ready
    try {
      // await SettingsService.updateSetting('dark_mode_enabled', newMode, 'boolean');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
