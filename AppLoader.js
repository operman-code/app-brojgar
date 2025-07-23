// AppLoader.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import DatabaseInitializer from './database/DatabaseInitializer';
import App from './App';

const AppLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingMessage('Setting up Brojgar...');
      
      // Initialize database and populate with business data
      await DatabaseInitializer.initializeApp();
      
      setLoadingMessage('Loading business data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoadingMessage('Ready!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setLoadingMessage('Initialization failed - Loading anyway...');
      
      // Still show the app even if init fails, after a brief delay
      await new Promise(resolve => setTimeout(resolve, 1000));
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
            <Text style={styles.brandName}>Brojgar</Text>
            <Text style={styles.brandTagline}>Complete Business Solution</Text>
          </View>
        </View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          
          {/* Feature highlights */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Getting Ready:</Text>
            <Text style={styles.featureItem}>🗄️  Setting up database</Text>
            <Text style={styles.featureItem}>📦 Loading inventory system</Text>
            <Text style={styles.featureItem}>👥 Preparing customer data</Text>
            <Text style={styles.featureItem}>🧾 Configuring invoices</Text>
            <Text style={styles.featureItem}>📊 Initializing analytics</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Brojgar Business Management v1.0.0</Text>
          <Text style={styles.footerSubtext}>Powered by SQLite & React Native</Text>
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
    paddingVertical: 60,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
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
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#bfdbfe',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#93c5fd',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '300',
  },
});

export default AppLoader;
