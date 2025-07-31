// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment if you want to persist theme
// import { Appearance } from 'react-native'; // Uncomment if you want to detect system theme

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
  statusBar: 'dark', // Status bar style for light theme
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
  statusBar: 'light', // Status bar style for dark theme
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
  const [theme, setTheme] = useState(lightTheme);

  // Function to load theme preference (e.g., from AsyncStorage)
  const loadThemePreference = async () => {
    try {
      // const storedTheme = await AsyncStorage.getItem('appTheme');
      // if (storedTheme !== null) {
      //   setIsDarkMode(storedTheme === 'dark');
      // } else {
      //   // Fallback to system preference if no stored theme
      //   const systemColorScheme = Appearance.getColorScheme();
      //   setIsDarkMode(systemColorScheme === 'dark');
      // }
      console.log('Theme preference loading not implemented yet.');
    } catch (e) {
      console.error('Failed to load theme preference:', e);
    }
  };

  // Function to save theme preference and toggle
  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // try {
    //   await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
    // } catch (e) {
    //   console.error('Failed to save theme preference:', e);
    // }
  };

  useEffect(() => {
    loadThemePreference();
    // Optional: Listen for system theme changes
    // const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    //   setIsDarkMode(colorScheme === 'dark');
    // });
    // return () => subscription.remove();
  }, []);

  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {/* Managing StatusBar style based on current theme */}
      <StatusBar style={theme.statusBar} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
