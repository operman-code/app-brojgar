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
