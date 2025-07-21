import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
    <Text style={{ fontSize: 18, fontWeight: "600", color: "#374151" }}>{name} Page</Text>
    <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>Coming Soon...</Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color: color === "#3b82f6" ? "🏠" : "🏠" }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Parties" 
        children={() => <PlaceholderScreen name="Parties/Customers" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color: color === "#3b82f6" ? "👥" : "👥" }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        children={() => <PlaceholderScreen name="Inventory/Items" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color: color === "#3b82f6" ? "📦" : "📦" }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Reports" 
        children={() => <PlaceholderScreen name="Reports" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color: color === "#3b82f6" ? "📊" : "📊" }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="More" 
        children={() => <PlaceholderScreen name="More/Settings" />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color: color === "#3b82f6" ? "⚙️" : "⚙️" }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;