import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

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
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}