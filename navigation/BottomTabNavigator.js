import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import PartiesScreen from "../screens/Parties/PartiesScreen";
import InventoryScreen from "../screens/Inventory/InventoryScreen";
import ReportsScreen from "../screens/Reports/ReportsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import InvoiceScreen from "../screens/Invoice/InvoiceScreen";
import InvoiceTemplateScreen from "../screens/Invoice/InvoiceTemplateScreen";
import NotificationScreen from "../screens/Notifications/NotificationScreen";
import GlobalSearchScreen from "../screens/Search/GlobalSearchScreen";
import { View, Text, TouchableOpacity } from "react-native";

const Tab = createBottomTabNavigator();

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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            style={[
              props.style,
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        children={() => (
          <DashboardScreen 
            navigation={navigation} 
            route={createRoute('Dashboard')}
          />
        )}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{
                fontSize: 20,
                opacity: focused ? 1 : 0.7,
              }}>
                🏠
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        children={() => (
          <PartiesScreen 
            navigation={navigation} 
            route={createRoute('Parties')}
          />
        )}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{
                fontSize: 20,
                opacity: focused ? 1 : 0.7,
              }}>
                👥
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        children={() => (
          <InventoryScreen 
            navigation={navigation} 
            route={createRoute('Inventory')}
          />
        )}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{
                fontSize: 20,
                opacity: focused ? 1 : 0.7,
              }}>
                📦
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        children={() => (
          <ReportsScreen 
            navigation={navigation} 
            route={createRoute('Reports')}
          />
        )}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{
                fontSize: 20,
                opacity: focused ? 1 : 0.7,
              }}>
                📊
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        children={() => (
          <SettingsScreen 
            navigation={navigation} 
            route={createRoute('Settings')}
          />
        )}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{
                fontSize: 20,
                opacity: focused ? 1 : 0.7,
              }}>
                ⚙️
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
