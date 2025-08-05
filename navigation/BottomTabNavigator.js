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
import BackupRestoreScreen from "../screens/Settings/BackupRestoreScreen";
import { View, Text, TouchableOpacity } from "react-native";

// Import new navigation components
import MainLayout from "./components/MainLayout";
import EnhancedBottomTabBar from "./components/EnhancedBottomTabBar";
import { NavigationProvider, useNavigation as useCustomNavigation } from "../context/NavigationContext";

const Tab = createBottomTabNavigator();

// Enhanced Navigator Component with new UI
const EnhancedNavigator = () => {
  const { currentRoute, routeParams, navigateTo } = useCustomNavigation();

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
      
      case 'InvoicePreview':
        return (
          <MainLayout title="Invoice Preview" showSearch={false}>
            <InvoicePreviewScreen navigation={navigation} route={route} />
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
      
      case 'BackupRestore':
        return (
          <MainLayout title="Backup & Restore" showSearch={false}>
            <BackupRestoreScreen navigation={navigation} route={route} />
          </MainLayout>
        );
      
      case 'Dashboard':
      default:
        return (
          <MainLayout title="Dashboard">
            <DashboardScreen navigation={navigation} route={route} />
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
  // Use the new enhanced navigator wrapped with NavigationProvider
  return (
    <NavigationProvider>
      <EnhancedNavigator />
    </NavigationProvider>
  );
};

export default BottomTabNavigator;
