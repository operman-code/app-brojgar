import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import DatabaseService from './database/DatabaseService';
import NotificationService from './screens/Notifications/services/NotificationService';
import GlobalSearchService from './screens/Search/services/GlobalSearchService';
import BackupService from './screens/Backup/services/BackupService';
import SettingsService from './screens/Settings/services/SettingsService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // RESET DATABASE FIRST - COMMENTED OUT AFTER FIRST RUN
      // await resetDatabase();
      
      // Initialize database
      await DatabaseService.init();
      console.log('✅ Database initialized');
      
      // Small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize all services with error handling
      try {
        await NotificationService.checkAndCreateAutomaticNotifications();
        console.log('✅ Notification service initialized');
      } catch (error) {
        console.warn('⚠️ Notification service initialization failed:', error);
      }

      try {
        await GlobalSearchService.initializeSearch();
        console.log('✅ Search service initialized');
      } catch (error) {
        console.warn('⚠️ Search service initialization failed:', error);
      }

      try {
        await BackupService.initializeBackupSystem();
        console.log('✅ Backup service initialized');
      } catch (error) {
        console.warn('⚠️ Backup service initialization failed:', error);
      }

      try {
        await SettingsService.initializeSettings();
        console.log('✅ Settings service initialized');
      } catch (error) {
        console.warn('⚠️ Settings service initialization failed:', error);
      }
      
      console.log('✅ All services initialized');
      
      // Schedule automatic backup check
      try {
        await BackupService.scheduleAutomaticBackup();
        console.log('✅ Automatic backup check completed');
      } catch (error) {
        console.warn('⚠️ Automatic backup check failed:', error);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // RESET function - COMMENTED OUT AFTER FIRST RUN
  // const resetDatabase = async () => {
  //   try {
  //     console.log('🗑️ Resetting database completely...');
      
  //     // Get database connection without initializing
  //     const SQLite = require('expo-sqlite');
  //     const db = await SQLite.openDatabaseAsync('brojgar_business.db');
      
  //     // Drop all tables
  //     const tables = [
  //       'parties', 'inventory_items', 'categories', 'invoices', 
  //       'invoice_items', 'transactions', 'notifications', 
  //       'business_settings', 'recent_searches', 'backups'
  //     ];
      
  //     for (const table of tables) {
  //       try {
  //         await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
  //         console.log(`✅ Dropped table: ${table}`);
  //       } catch (error) {
  //         console.warn(`Could not drop table ${table}:`, error);
  //       }
  //     }
      
  //     await db.closeAsync();
  //     console.log('✅ Database reset complete');
  //   } catch (error) {
  //     console.error('❌ Error resetting database:', error);
  //   }
  // };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing Brojgar Business...</Text>
        <Text style={styles.loadingSubtext}>Setting up your workspace</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" backgroundColor="#ffffff" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
