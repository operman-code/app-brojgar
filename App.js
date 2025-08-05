import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';

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
import GoogleDriveService from './screens/Settings/services/GoogleDriveService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const setupAutoBackup = async () => {
    try {
      // Load backup settings
      await GoogleDriveService.loadBackupSettings();
      
      // Check if auto backup is needed
      const needsBackup = await GoogleDriveService.checkBackupNeeded();
      if (needsBackup) {
        await GoogleDriveService.performAutoBackup();
      }
    } catch (error) {
      console.error('Auto backup setup failed:', error);
    }
  };

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Brojgar Business App...');
      
      // Initialize database
      await DatabaseService.init();
      
      // Setup auto backup
      await setupAutoBackup();
      
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
