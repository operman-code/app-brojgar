import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert, View, ActivityIndicator, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Import navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthNavigator from './navigation/AuthNavigator';

// Import contexts
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import services
import DatabaseService from './database/DatabaseService';
import NotificationService from './screens/Notifications/services/NotificationService';
import GlobalSearchService from './screens/Search/services/GlobalSearchService';
import BackupService from './screens/Backup/services/BackupService';
import SettingsService from './screens/Settings/services/SettingsService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const resetDatabase = async () => {
    try {
      console.log('🔄 Resetting database...');
      
      // Open database directly to drop all tables
      const db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
      // Drop all existing tables
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
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Separate component to access auth context
const AppContent = () => {
  const { isAuthenticated, isLoading, isFirstLaunch } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#64748b',
          fontWeight: '500'
        }}>
          Loading Brojgar...
        </Text>
      </View>
    );
  }

  // Show appropriate navigator based on auth state
  return isAuthenticated ? <BottomTabNavigator /> : <AuthNavigator />;
}