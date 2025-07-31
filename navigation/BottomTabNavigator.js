// navigation/BottomTabNavigator.js
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { View, Text, TouchableOpacity } from "react-native";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [invoiceData, setInvoiceData] = useState(null);
  const [routeParams, setRouteParams] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedTheme, setSelectedTheme] = useState('standard');

  const navigation = {
    navigate: (screen, params) => {
      console.log('🚀 Navigating to:', screen, params);
      
      if (screen === "Invoice") {
        setCurrentScreen('invoice');
        setRouteParams(params);
      } else if (screen === "InvoiceTemplate") {
        setCurrentScreen('invoiceTemplate');
        setInvoiceData(params?.invoiceData);
        setRouteParams(params);
      } else if (screen === "InvoicePreview") {
        setCurrentScreen('invoicePreview');
        setInvoiceData(params?.invoiceData);
        setSelectedTemplate(params?.selectedTemplate || 'classic');
        setSelectedTheme(params?.selectedTheme || 'standard');
        setRouteParams(params);
      } else if (screen === "Notifications") {
        setCurrentScreen('notifications');
        setRouteParams(params);
      } else if (screen === "Search") {
        setCurrentScreen('search');
        setRouteParams(params);
      } else if (screen === "Reports") {
        setCurrentScreen('reports');
        setRouteParams(params);
      } else if (screen === "Backup") {
        console.log('Backup navigation - implement if needed');
      } else {
        setCurrentScreen('main');
        setRouteParams(params);
      }
    },
    goBack: () => {
      console.log('🔙 Going back from:', currentScreen);
      
      if (currentScreen === 'invoicePreview') {
        setCurrentScreen('invoiceTemplate');
      } else if (currentScreen === 'invoiceTemplate') {
        setCurrentScreen('invoice');
      } else if (currentScreen === 'invoice') {
        setCurrentScreen('main');
      } else if (currentScreen === 'notifications' || currentScreen === 'search' || currentScreen === 'reports') {
        setCurrentScreen('main');
      } else {
        setCurrentScreen('main');
      }
      setRouteParams(null);
    },
    push: (screen, params) => navigation.navigate(screen, params),
    replace: (screen, params) => navigation.navigate(screen, params),
    reset: () => {
      setCurrentScreen('main');
      setRouteParams(null);
      setInvoiceData(null);
    }
  };

  // Create route object that matches React Navigation structure
  const createRoute = (screenName, params = null) => ({
    params: params || routeParams,
    name: screenName,
    key: `${screenName}-${Date.now()}`
  });

  if (currentScreen === 'invoice') {
    return (
      <InvoiceScreen 
        navigation={navigation} 
        route={createRoute('Invoice', routeParams)}
      />
    );
  }

  if (currentScreen === 'invoiceTemplate') {
    return (
      <InvoiceTemplateScreen 
        navigation={navigation} 
        route={createRoute('InvoiceTemplate', { invoiceData })}
      />
    );
  }

  if (currentScreen === 'invoicePreview') {
    return (
      <InvoicePreviewScreen 
        navigation={navigation} 
        route={createRoute('InvoicePreview', { 
          invoiceData,
          selectedTemplate,
          selectedTheme
        })}
      />
    );
  }

  if (currentScreen === 'notifications') {
    return (
      <NotificationScreen 
        navigation={navigation} 
        route={createRoute('Notifications', routeParams)}
      />
    );
  }

  if (currentScreen === 'search') {
    return (
      <GlobalSearchScreen 
        navigation={navigation} 
        route={createRoute('Search', routeParams)}
      />
    );
  }

  if (currentScreen === 'reports') {
    return (
      <ReportsScreen 
        navigation={navigation} 
        route={createRoute('Reports', routeParams)}
      />
    );
  }

  // Main tab navigation
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
