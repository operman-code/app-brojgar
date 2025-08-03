import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import EnhancedDashboardScreen from "../screens/Dashboard/EnhancedDashboardScreen";
import PartiesScreen from "../screens/Parties/PartiesScreen";
import InventoryScreen from "../screens/Inventory/InventoryScreen";
import ReportsScreen from "../screens/Reports/ReportsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import InvoiceScreen from "../screens/Invoice/InvoiceScreen";
import InvoiceTemplateScreen from "../screens/Invoice/InvoiceTemplateScreen";
import NotificationScreen from "../screens/Notifications/NotificationScreen";
import GlobalSearchScreen from "../screens/Search/GlobalSearchScreen";
import { View, Text, TouchableOpacity } from "react-native";

// Import new navigation components
import MainLayout from "./components/MainLayout";
import EnhancedBottomTabBar from "./components/EnhancedBottomTabBar";
import { NavigationProvider, useNavigation } from "../context/NavigationContext";

const Tab = createBottomTabNavigator();

// Enhanced Navigator Component with new UI
const EnhancedNavigator = () => {
  const { currentRoute, routeParams, navigateTo } = useNavigation();

  // Create navigation object compatible with existing screens
  const navigation = {
    navigate: navigateTo,
    goBack: () => {
      if (currentRoute !== 'Dashboard') {
        navigateTo('Dashboard');
      }
    },
    push: navigateTo,
    replace: navigateTo,
  };

  // Create route object that matches React Navigation structure
  const createRoute = (screenName, params = null) => ({
    params: params || routeParams,
    name: screenName,
    key: `${screenName}-${Date.now()}`
  });

  // Render current screen with MainLayout wrapper
  const renderCurrentScreen = () => {
    const route = createRoute(currentRoute, routeParams);
    
    switch (currentRoute) {
      case 'Invoice':
        return (
          <MainLayout title="Create Invoice" showSearch={false}>
            <InvoiceScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'InvoiceTemplate':
        return (
          <MainLayout title="Invoice Template" showSearch={false}>
            <InvoiceTemplateScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Notifications':
        return (
          <MainLayout title="Notifications" showSearch={false}>
            <NotificationScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Search':
        return (
          <MainLayout title="Search" showSearch={true}>
            <GlobalSearchScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Reports':
        return (
          <MainLayout title="Reports">
            <ReportsScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Parties':
        return (
          <MainLayout title="Parties">
            <PartiesScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Inventory':
        return (
          <MainLayout title="Inventory">
            <InventoryScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Settings':
        return (
          <MainLayout title="Settings" showSearch={false}>
            <SettingsScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Dashboard':
      default:
        return (
          <MainLayout title="Dashboard">
            <EnhancedDashboardScreen navigation={navigation} route={route} />
          </MainLayout>
        );
    }
  };

  // Show bottom tab bar only for main screens
  const mainScreens = ['Dashboard', 'Parties', 'Inventory', 'Reports', 'Settings'];
  const showBottomTabs = mainScreens.includes(currentRoute);

  return (
    <View style={{ flex: 1 }}>
      {renderCurrentScreen()}
      {showBottomTabs && (
        <EnhancedBottomTabBar
          currentRoute={currentRoute}
          onTabPress={navigateTo}
        />
      )}
    </View>
  );
};

const BottomTabNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [invoiceData, setInvoiceData] = useState(null);
  const [routeParams, setRouteParams] = useState(null);

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
        // Handle backup navigation if needed
        console.log('Backup navigation - implement if needed');
      } else {
        // Handle main tab navigation
        setCurrentScreen('main');
        setRouteParams(params);
      }
    },
    goBack: () => {
      console.log('🔙 Going back from:', currentScreen);
      
      if (currentScreen === 'invoiceTemplate') {
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
    // Add these methods that some screens might expect
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
  
  // Use the new enhanced navigator wrapped with NavigationProvider
  return (
    <NavigationProvider>
      <EnhancedNavigator />
    </NavigationProvider>
  );
};

export default BottomTabNavigator;
