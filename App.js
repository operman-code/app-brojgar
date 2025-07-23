// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Import working tab navigation
import BottomTabNavigator from './navigation/BottomTabNavigator';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingMessage('Setting up app...');
      
      // Simple delay to show loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoadingMessage('Ready!');
      
      // Another small delay before showing the main app
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setLoadingMessage('Initialization failed');
      // Still show the app even if init fails
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
        
        <View style={styles.brandContainer}>
          <Text style={styles.logoIcon}>📊</Text>
          <Text style={styles.brandName}>Brojgar</Text>
          <Text style={styles.brandTagline}>Complete Business Solution</Text>
        </View>

        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Getting Ready:</Text>
            <Text style={styles.featureItem}>📦 Inventory System</Text>
            <Text style={styles.featureItem}>👥 Customer Management</Text>
            <Text style={styles.featureItem}>🧾 Invoice Templates</Text>
            <Text style={styles.featureItem}>📊 Analytics Dashboard</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Brojgar Business Management v1.0.0</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1e40af",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 16,
    color: "#bfdbfe",
    textAlign: "center",
    fontWeight: "300",
  },
  loadingSection: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "500",
  },
  featuresContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    width: "100%",
  },
  featuresTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 14,
    color: "#bfdbfe",
    marginBottom: 8,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#bfdbfe",
    textAlign: "center",
    fontWeight: "500",
  },
});
