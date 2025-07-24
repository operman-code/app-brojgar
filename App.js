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
      
      // Initialize database first
      await DatabaseService.init();
      console.log('✅ Database initialized');
      
      // Initialize all services
      await Promise.all([
        NotificationService.checkAndCreateAutomaticNotifications(),
        GlobalSearchService.initializeSearch(),
        BackupService.initializeBackupSystem(),
        SettingsService.initializeSettings()
      ]);
      
      console.log('✅ All services initialized');
      
      // Schedule automatic backup check
      await BackupService.scheduleAutomaticBackup();
      console.log('✅ Automatic backup check completed');
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

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
