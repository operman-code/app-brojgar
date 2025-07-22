// AppLoader.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
// import DatabaseInitializer from './database/DatabaseInitializer'; // Temporarily commented out
import App from './App';

const AppLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingMessage('Setting up app...');
      
      // Temporarily disable database initialization to fix TurboModule error
      // await DatabaseInitializer.initializeApp();
      
      // Simple delay instead
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoadingMessage('Ready!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setLoadingMessage('Initialization failed');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
        
        {/* App Logo/Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📊</Text>
            <Text style={styles.brandName}>Business Manager</Text>
            <Text style={styles.brandTagline}>Complete Business Solution</Text>
          </View>
        </View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
            
            {/* Feature Preview */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Getting Ready:</Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>📦 Setting up inventory system</Text>
                <Text style={styles.featureItem}>👥 Configuring customer management</Text>
                <Text style={styles.featureItem}>🧾 Preparing invoice templates</Text>
                <Text style={styles.featureItem}>📊 Loading analytics dashboard</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Business Management App</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>
    );
  }

  return <App />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 16,
    color: '#bfdbfe',
    marginBottom: 16,
    fontWeight: '600',
  },
  featuresList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#93c5fd',
    marginBottom: 8,
    textAlign: 'left',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    color: '#6b7280',
  },
});

export default AppLoader;
