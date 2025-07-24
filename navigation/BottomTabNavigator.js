import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreenMyBillBook";
import PartiesScreen from "../screens/Parties/PartiesScreenMyBillBook";
import InventoryScreen from "../screens/Inventory/InventoryScreenMyBillBook";
import ReportsScreen from "../screens/Reports/ReportsScreenMyBillBook";
import SettingsScreen from "../screens/Settings/SettingsScreenMyBillBook";
import InvoiceScreen from "../screens/Invoice/InvoiceScreenMyBillBook";
import InvoiceTemplateScreen from "../screens/Invoice/InvoiceTemplateScreenMyBillBook";
import NotificationScreen from "../screens/Notifications/NotificationScreenMyBillBook";
import GlobalSearchScreen from "../screens/Search/GlobalSearchScreenMyBillBook";
import { View, Text, TouchableOpacity } from "react-native";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [invoiceData, setInvoiceData] = useState(null);

  const navigation = {
    navigate: (screen, params) => {
      if (screen === "Invoice") {
        setCurrentScreen('invoice');
      } else if (screen === "InvoiceTemplate") {
        setCurrentScreen('invoiceTemplate');
        setInvoiceData(params?.invoiceData);
      } else if (screen === "Notifications") {
        setCurrentScreen('notifications');
      } else if (screen === "Search") {
        setCurrentScreen('search');
      } else if (screen === "Dashboard") {
        setCurrentScreen('main');
      } else if (screen === "Parties") {
        setCurrentScreen('main');
      } else if (screen === "Inventory") {
        setCurrentScreen('main');
      } else if (screen === "Reports") {
        setCurrentScreen('main');
      } else if (screen === "Settings") {
        setCurrentScreen('main');
      }
    },
    goBack: () => {
      if (currentScreen === 'invoiceTemplate') {
        setCurrentScreen('invoice');
      } else if (currentScreen === 'invoice') {
        setCurrentScreen('main');
      } else if (currentScreen === 'notifications' || currentScreen === 'search') {
        setCurrentScreen('main');
      }
    }
  };

  if (currentScreen === 'invoice') {
    return <InvoiceScreen navigation={navigation} />;
  }

  if (currentScreen === 'invoiceTemplate') {
    return <InvoiceTemplateScreen navigation={navigation} route={{ params: { invoiceData } }} />;
  }

  if (currentScreen === 'notifications') {
    return <NotificationScreen navigation={navigation} />;
  }

  if (currentScreen === 'search') {
    return <GlobalSearchScreen navigation={navigation} />;
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
        children={() => <DashboardScreen navigation={navigation} />}
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
        children={() => <PartiesScreen navigation={navigation} />}
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
        children={() => <InventoryScreen navigation={navigation} />}
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
        children={() => <ReportsScreen navigation={navigation} />}
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
        children={() => <SettingsScreen navigation={navigation} />}
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