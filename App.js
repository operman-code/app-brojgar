where to update in the dashboard screen
Let me show you exactly where to update the StatusBar in your DashboardScreen.js:

Update DashboardScreen.js StatusBar
Find these specific lines in your screens/Dashboard/DashboardScreen.js file and replace them:

1. First StatusBar (in the loading state) - around line 400-450:
Find this:

if (loading) {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.loadingContent}>
        <Text style={styles.loadingIcon}>📊</Text>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    </SafeAreaView>
  );
}
Replace with:

if (loading) {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <StatusBar style="dark" />
      <View style={styles.loadingContent}>
        <Text style={styles.loadingIcon}>📊</Text>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    </SafeAreaView>
  );
}
2. Second StatusBar (in the main render) - around line 450-500:
Find this:

return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" />
    
    {/* Header */}
    <LinearGradient
      colors={['#3B82F6', '#1E40AF']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
Replace with:

return (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    
    {/* Header */}
    <LinearGradient
      colors={['#3B82F6', '#1E40AF']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
Summary of Changes:
Loading state: barStyle="dark-content" → style="dark"
Main render: barStyle="dark-content" → style="light" (because the header has a dark gradient background)
Why these changes?
Loading state: Uses style="dark" because the background is light
Main render: Uses style="light" because the header has a dark blue gradient, so we want light text in the status bar
After making these two changes, the StatusBar warnings should disappear and the status bar will properly adapt to your app's design! 🎉

shows render error on phone again check something is causing in context folder check all
Let me check the ThemeContext file and fix any potential issues. The error is likely in the context setup.

1. Fixed ThemeContext.js
// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

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
  }
ERROR  Warning: TypeError: 0, _native.useLocale is not a function (it is undefined)

This error is located at:

  43 | };
  44 |
> 45 | export const ThemeProvider = ({ children }) => {
     |                                         ^
  46 |   const [isDarkMode, setIsDarkMode] = useState(false);
  47 |   const [theme, setTheme] = useState(lightTheme);
  48 |

Call Stack
  MainStack (<anonymous>)
  BottomTabNavigator (<anonymous>)
  ThemeProvider (context/ThemeContext.js:45:41)
  RNCSafeAreaProvider (<anonymous>)
  App (App.js:76:41)

The error is related to the useLocale function. Let me fix the ThemeContext by removing any problematic imports and simplifying it:

Fixed ThemeContext.js
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
Also, let's simplify the App.js to avoid any potential issues:
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

// Import theme
import { ThemeProvider } from './context/ThemeContext';

// Import services
import DatabaseService from './database/DatabaseService';
import NotificationService from './screens/Notifications/services/NotificationService';
import GlobalSearchService from './screens/Search/services/GlobalSearchService';
import BackupService from './screens/Backup/services/BackupService';
import SettingsService from './screens/Settings/services/SettingsService';

const { width, height } = Dimensions.get('window');

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar style="light" />
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.loadingContent}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📊</Text>
          <Text style={styles.appName}>Brojgar</Text>
          <Text style={styles.appTagline}>Business Management</Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.loadingAnimation}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Initializing App...</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSteps}>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Loading Database</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Setting up Services</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Preparing UI</Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Brojgar Business</Text>
        </View>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const resetDatabase = async () => {
    try {
      console.log('🔄 Resetting database...');
      
      const db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
      const tables = [
        'notifications', 'recent_searches', 'backups', 'invoice_items', 
        'invoices', 'transactions', 'inventory_items', 'parties', 
        'categories', 'business_settings'
      ];

      for (const table of tables) {
        try {
          await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
        } catch (error) {
          console.log(`Note: Table ${table} may not exist`);
        }
      }

      await db.closeAsync();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
    }
  };

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Reset database first to ensure clean schema
      await resetDatabase();
      
      // Initialize database
      await DatabaseService.init();
      
      // Small delay to ensure tables are created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Initialize other services with error handling
      try {
        await NotificationService.init();
        console.log('✅ Notification service initialized');
      } catch (error) {
        console.error('❌ Notification service error:', error);
      }

      try {
        await GlobalSearchService.init();
        console.log('✅ Search service initialized');
      } catch (error) {
        console.error('❌ Search service error:', error);
      }

      try {
        await BackupService.init();
        console.log('✅ Backup service initialized');
      } catch (error) {
        console.error('❌ Backup service error:', error);
      }

      try {
        await SettingsService.init();
        console.log('✅ Settings service initialized');
      } catch (error) {
        console.error('❌ Settings service error:', error);
      }

      console.log('✅ All services initialized');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <BottomTabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  loadingAnimation: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '500',
  },
  progressSteps: {
    width: '80%',
    maxWidth: 300,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#C7D2FE',
  },
});
Key Changes Made:
✅ Removed problematic imports from ThemeContext ✅ Simplified theme loading without SettingsService dependency ✅ Removed StatusBar from ThemeContext to avoid conflicts ✅ Cleaned up App.js to prevent any import issues ✅ Added proper error handling for theme operations

The error was likely caused by:

Missing or incorrect imports in ThemeContext
Conflicts with StatusBar usage
SettingsService not being properly initialized
Try running the app again - it should work without the useLocale error now! 🎉


 ERROR  Warning: TypeError: 0, _native.useLocale is not a function (it is undefined)

This error is located at:

  42 | };
  43 |
> 44 | export const ThemeProvider = ({ children }) => {
     |                                         ^
  45 |   const [isDarkMode, setIsDarkMode] = useState(false);
  46 |   const [theme, setTheme] = useState(lightTheme);
  47 |

Call Stack
  MainStack (<anonymous>)
  BottomTabNavigator (<anonymous>)
  ThemeProvider (context/ThemeContext.js:44:41)
  RNCSafeAreaProvider (<anonymous>)
  App (App.js:76:41)

The error is still persisting. Let me check if there's an issue with the BottomTabNavigator or any other component that might be causing this. Let me provide a completely simplified version to isolate the issue:

1. First, let's create a minimal ThemeContext to test:
// context/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const lightTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  primary: '#3b82f6',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const darkTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  primary: '#3b82f6',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  border: '#334155',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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
2. Let's also simplify the BottomTabNavigator to remove any potential issues:
// navigation/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import screens
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import PartiesScreen from "../screens/Parties/PartiesScreen";
import InventoryScreen from "../screens/Inventory/InventoryScreen";
import ReportsScreen from "../screens/Reports/ReportsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import InvoiceScreen from "../screens/Invoice/InvoiceScreen";
import InvoiceTemplateScreen from "../screens/Invoice/InvoiceTemplateScreen";
import InvoicePreviewScreen from "../screens/Invoice/InvoicePreviewScreen";
import NotificationScreen from "../screens/Notifications/NotificationScreen";
import GlobalSearchScreen from "../screens/Search/GlobalSearchScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="InvoiceTemplate" component={InvoiceTemplateScreen} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Search" component={GlobalSearchScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
};

// Main Tabs Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarLabel: 'Parties',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const BottomTabNavigator = () => {
  return <MainStack />;
};

export default BottomTabNavigator;
3. And let's create a simple test DashboardScreen to isolate the issue:
// screens/Dashboard/DashboardScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Brojgar!</Text>
        <Text style={styles.subtitleText}>Business Management App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default DashboardScreen;
4. Update App.js to be minimal:
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

// Import theme
import { ThemeProvider } from './context/ThemeContext';

// Import services
import DatabaseService from './database/DatabaseService';

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar style="light" />
    <View style={styles.loadingContent}>
      <Text style={styles.logoText}>📊</Text>
      <Text style={styles.appName}>Brojgar</Text>
      <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  </SafeAreaView>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Initialize database
      await DatabaseService.init();
      console.log('✅ Database initialized');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <BottomTabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});
Try this simplified version first. If it works, we can gradually add back the features. The useLocale error might be coming from one of the other components or services. This minimal version should help us identify where the issue is coming from.

Let me know if this works and we can then add back the features one by one! 🎯

this themcontext i have added only for dark mode setup if user wants
I understand! Since the ThemeContext is only for dark mode setup and the error is persisting, let's temporarily remove it to get the app working first, then add it back later. Here's the simplified approach:

1. Remove ThemeContext from App.js temporarily:
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

// Import services
import DatabaseService from './database/DatabaseService';

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar style="light" />
    <View style={styles.loadingContent}>
      <Text style={styles.logoText}>📊</Text>
      <Text style={styles.appName}>Brojgar</Text>
      <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  </SafeAreaView>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Initialize database
      await DatabaseService.init();
      console.log('✅ Database initialized');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});
2. Keep the simplified BottomTabNavigator:
// navigation/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, Platform } from "react-native";

// Import screens
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import PartiesScreen from "../screens/Parties/PartiesScreen";
import InventoryScreen from "../screens/Inventory/InventoryScreen";
import ReportsScreen from "../screens/Reports/ReportsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import InvoiceScreen from "../screens/Invoice/InvoiceScreen";
import InvoiceTemplateScreen from "../screens/Invoice/InvoiceTemplateScreen";
import InvoicePreviewScreen from "../screens/Invoice/InvoicePreviewScreen";
import NotificationScreen from "../screens/Notifications/NotificationScreen";
import GlobalSearchScreen from "../screens/Search/GlobalSearchScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="InvoiceTemplate" component={InvoiceTemplateScreen} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Search" component={GlobalSearchScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
};

// Main Tabs Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarLabel: 'Parties',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const BottomTabNavigator = () => {
  return <MainStack />;
};

export default BottomTabNavigator;
3. Create a simple DashboardScreen:
// screens/Dashboard/DashboardScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Brojgar!</Text>
        <Text style={styles.subtitleText}>Business Management App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default DashboardScreen;
This approach will:

✅ Remove the ThemeContext temporarily to isolate the error ✅ Get the basic app working first ✅ Allow us to identify where the useLocale error is coming from ✅ Enable us to add dark mode later once the core app is stable

Once this works, we can:

Add back the ThemeContext with proper error handling
Gradually add back the enhanced UI components
Implement dark mode functionality
Try this simplified version first and let me know if the error disappears! 🎯

i dont want to do any temporary test just for now remove the context theme for now
Perfect! Let's simply remove the ThemeContext from App.js and keep everything else as is:

Updated App.js (without ThemeContext)
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

// Import services
import DatabaseService from './database/DatabaseService';
import NotificationService from './screens/Notifications/services/NotificationService';
import GlobalSearchService from './screens/Search/services/GlobalSearchService';
import BackupService from './screens/Backup/services/BackupService';
import SettingsService from './screens/Settings/services/SettingsService';

const { width, height } = Dimensions.get('window');

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar style="light" />
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.loadingContent}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📊</Text>
          <Text style={styles.appName}>Brojgar</Text>
          <Text style={styles.appTagline}>Business Management</Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.loadingAnimation}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Initializing App...</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSteps}>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Loading Database</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Setting up Services</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Preparing UI</Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Brojgar Business</Text>
        </View>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const resetDatabase = async () => {
    try {
      console.log('🔄 Resetting database...');
      setLoadingStep(1);
      
      const db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
      const tables = [
        'notifications', 'recent_searches', 'backups', 'invoice_items', 
        'invoices', 'transactions', 'inventory_items', 'parties', 
        'categories', 'business_settings'
      ];

      for (const table of tables) {
        try {
          await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
        } catch (error) {
          console.log(`Note: Table ${table} may not exist`);
        }
      }

      await db.closeAsync();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
    }
  };

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Reset database first to ensure clean schema
      await resetDatabase();
      
      // Initialize database
      setLoadingStep(2);
      await DatabaseService.init();
      
      // Small delay to ensure tables are created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Initialize other services with error handling
      setLoadingStep(3);
      try {
        await NotificationService.init();
        console.log('✅ Notification service initialized');
      } catch (error) {
        console.error('❌ Notification service error:', error);
      }

      try {
        await GlobalSearchService.init();
        console.log('✅ Search service initialized');
      } catch (error) {
        console.error('❌ Search service error:', error);
      }

      try {
        await BackupService.init();
        console.log('✅ Backup service initialized');
      } catch (error) {
        console.error('❌ Backup service error:', error);
      }

      try {
        await SettingsService.init();
        console.log('✅ Settings service initialized');
      } catch (error) {
        console.error('❌ Settings service error:', error);
      }

      console.log('✅ All services initialized');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  loadingAnimation: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '500',
  },
  progressSteps: {
    width: '80%',
    maxWidth: 300,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#C7D2FE',
  },
});
Key Changes:
✅ Removed ThemeProvider import and usage ✅ Removed ThemeProvider wrapper from the NavigationContainer ✅ Kept all other functionality intact ✅ Maintained the beautiful loading screen ✅ Preserved all service initializations

Now the app should run without the useLocale error since we've removed the ThemeContext completely. The app will work with the default light theme, and you can add dark mode functionality later when needed.

Try running the app now - it should work perfectly! 🎉

ERROR  Warning: TypeError: 0, _native.useLocale is not a function (it is undefined)

This error is located at:

  71 |
  72 | export default function App() {
> 73 |   const [isReady, setIsReady] = useState(false);
     |                                         ^
  74 |   const [loadingStep, setLoadingStep] = useState(0);
  75 |
  76 |   useEffect(() => {

Call Stack
  MainStack (<anonymous>)
  BottomTabNavigator (<anonymous>)
  RNCSafeAreaProvider (<anonymous>)
  App (App.js:73:41
The error is still persisting even after removing ThemeContext. This suggests the issue is coming from somewhere else. Let me check if there's an issue with the BottomTabNavigator or any of the screen components. Let's create a minimal test to isolate the problem:

1. Create a minimal test App.js:
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Simple test component
const TestScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Text style={styles.title}>Brojgar App</Text>
      <Text style={styles.subtitle}>Test Screen</Text>
    </View>
  </SafeAreaView>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TestScreen />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
Try this minimal version first. If this works, then the issue is in the BottomTabNavigator or one of the screen components. If this still shows the error, then the issue is with the NavigationContainer or SafeAreaProvider.

Let me know what happens with this minimal version and I'll help you identify the exact source of the problem! 🔍

this works shows test screen
Great! The minimal version works, which means the issue is in the BottomTabNavigator or one of the screen components. Let's add back the BottomTabNavigator step by step to identify the exact problem.

1. First, let's test with just the BottomTabNavigator (without any screen components):
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Simple test component
const TestScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Text style={styles.title}>Brojgar App</Text>
      <Text style={styles.subtitle}>Test Screen</Text>
    </View>
  </SafeAreaView>
);

// Simple BottomTabNavigator with just test screens
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const TestTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Test1"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test1',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Test2"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test2',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TestTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
Try this version. If it works, then the issue is in one of your screen components (DashboardScreen, etc.). If it doesn't work, then the issue is in the BottomTabNavigator setup.

Let me know what happens! 🔍

this also works
Perfect! So the issue is definitely in one of your screen components. Let's add back the screens one by one to identify which one is causing the useLocale error.

2. Let's test with just the DashboardScreen first:
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import DashboardScreen
import DashboardScreen from './screens/Dashboard/DashboardScreen';

// Simple test component
const TestScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Text style={styles.title}>Brojgar App</Text>
      <Text style={styles.subtitle}>Test Screen</Text>
    </View>
  </SafeAreaView>
);

// Simple BottomTabNavigator with DashboardScreen
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const TestTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TestTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
Try this version. If it shows the error, then the issue is in the DashboardScreen. If it works, then the issue is in one of the other screen components.

Let me know what happens! 🔍

okay this works
Great! So DashboardScreen is working fine. Let's add the other screens one by one to find the problematic one. Let's add PartiesScreen next:

3. Test with DashboardScreen and PartiesScreen:
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import PartiesScreen from './screens/Parties/PartiesScreen';

// Simple test component
const TestScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Text style={styles.title}>Brojgar App</Text>
      <Text style={styles.subtitle}>Test Screen</Text>
    </View>
  </SafeAreaView>
);

// Simple BottomTabNavigator with more screens
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const TestTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarLabel: 'Parties',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TestTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
Try this version. If it shows the error, then the issue is in PartiesScreen. If it works, we'll continue adding the other screens one by one.

Let me know what happens! 🔍

words
Great! PartiesScreen is also working fine. Let's continue adding the other screens. Let's add InventoryScreen next:

4. Test with DashboardScreen, PartiesScreen, and InventoryScreen:
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import PartiesScreen from './screens/Parties/PartiesScreen';
import InventoryScreen from './screens/Inventory/InventoryScreen';

// Simple test component
const TestScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Text style={styles.title}>Brojgar App</Text>
      <Text style={styles.subtitle}>Test Screen</Text>
    </View>
  </SafeAreaView>
);

// Simple BottomTabNavigator with more screens
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const TestTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarLabel: 'Parties',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Test"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TestTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
});
Try this version. If it shows the error, then the issue is in InventoryScreen. If it works, we'll continue with the next screen.

Let me know what happens! 🔍

nt-only warning and won't be shown in production.
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting low stock items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching categories: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching items: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total inventory value: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting categories count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching items: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching categories: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting categories count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total inventory value: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting low stock items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching items: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting categories count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total inventory value: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching categories: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting low stock items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting categories count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting low stock items count: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching categories: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error fetching items: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Query execution error: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
 ERROR  ❌ Error getting total inventory value: [Error: Call to function 'NativeDatabase.prepareAsync' has been rejected.
→ Caused by: java.lang.NullPointerException: java.lang.NullPointerException]
Perfect! We found the issue! The error is coming from InventoryScreen - it's trying to access the database but the database connection is null. This is happening because we removed the database initialization from App.js when we simplified it.

The good news is that we didn't get the useLocale error, which means the issue was likely in one of the other screens or services.

Let's fix this by adding back the database initialization to App.js:

Fixed App.js with Database Initialization:
// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

// Import services
import DatabaseService from './database/DatabaseService';
import NotificationService from './screens/Notifications/services/NotificationService';
import GlobalSearchService from './screens/Search/services/GlobalSearchService';
import BackupService from './screens/Backup/services/BackupService';
import SettingsService from './screens/Settings/services/SettingsService';

const { width, height } = Dimensions.get('window');

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar style="light" />
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.loadingContent}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>📊</Text>
          <Text style={styles.appName}>Brojgar</Text>
          <Text style={styles.appTagline}>Business Management</Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.loadingAnimation}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Initializing App...</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSteps}>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Loading Database</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Setting up Services</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>Preparing UI</Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Brojgar Business</Text>
        </View>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    initializeApp();
  }, []);

  const resetDatabase = async () => {
    try {
      console.log('🔄 Resetting database...');
      setLoadingStep(1);
      
      const db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
      const tables = [
        'notifications', 'recent_searches', 'backups', 'invoice_items', 
        'invoices', 'transactions', 'inventory_items', 'parties', 
        'categories', 'business_settings'
      ];

      for (const table of tables) {
        try {
          await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
        } catch (error) {
          console.log(`Note: Table ${table} may not exist`);
        }
      }

      await db.closeAsync();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
    }
  };

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Reset database first to ensure clean schema
      await resetDatabase();
      
      // Initialize database
      setLoadingStep(2);
      await DatabaseService.init();
      
      // Small delay to ensure tables are created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Initialize other services with error handling
      setLoadingStep(3);
      try {
        await NotificationService.init();
        console.log('✅ Notification service initialized');
      } catch (error) {
        console.error('❌ Notification service error:', error);
      }

      try {
        await GlobalSearchService.init();
        console.log('✅ Search service initialized');
      } catch (error) {
        console.error('❌ Search service error:', error);
      }

      try {
        await BackupService.init();
        console.log('✅ Backup service initialized');
      } catch (error) {
        console.error('❌ Backup service error:', error);
      }

      try {
        await SettingsService.init();
        console.log('✅ Settings service initialized');
      } catch (error) {
        console.error('❌ Settings service error:', error);
      }

      console.log('✅ All services initialized');
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  loadingAnimation: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '500',
  },
  progressSteps: {
    width: '80%',
    maxWidth: 300,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#C7D2FE',
  },
});
