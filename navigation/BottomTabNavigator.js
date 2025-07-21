import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f9fafb",
    padding: 20
  }}>
    <Text style={{ 
      fontSize: 24, 
      fontWeight: "bold", 
      color: "#374151",
      marginBottom: 8
    }}>
      {name}
    </Text>
    <Text style={{ 
      fontSize: 16, 
      color: "#6b7280", 
      textAlign: "center",
      marginBottom: 20
    }}>
      Coming Soon...
    </Text>
    <Text style={{ 
      fontSize: 14, 
      color: "#9ca3af", 
      textAlign: "center",
      lineHeight: 20
    }}>
      This feature is under development and will be available in the next update.
    </Text>
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
          height: 65,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20, 
              opacity: focused ? 1 : 0.7 
            }}>
              🏠
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Parties" 
        children={() => <PlaceholderScreen name="Parties/Customers" />}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20, 
              opacity: focused ? 1 : 0.7 
            }}>
              👥
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        children={() => <PlaceholderScreen name="Inventory/Items" />}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20, 
              opacity: focused ? 1 : 0.7 
            }}>
              📦
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Reports" 
        children={() => <PlaceholderScreen name="Reports" />}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20, 
              opacity: focused ? 1 : 0.7 
            }}>
              📊
            </Text>
          ),
        }}
      />
      <Tab.Screen 
        name="More" 
        children={() => <PlaceholderScreen name="More/Settings" />}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: focused ? 22 : 20, 
              opacity: focused ? 1 : 0.7 
            }}>
              ⚙️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;