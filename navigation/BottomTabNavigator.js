import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import PartiesScreen from "../screens/Parties/PartiesScreen";
import InventoryScreen from "../screens/Inventory/InventoryScreen";
import ReportsScreen from "../screens/Reports/ReportsScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import { View, Text, TouchableOpacity } from "react-native";

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: 12,
          height: 75,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
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
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{ 
                fontSize: focused ? 24 : 20, 
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}>
                🏠
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Parties" 
        component={PartiesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{ 
                fontSize: focused ? 24 : 20, 
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}>
                👥
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{ 
                fontSize: focused ? 24 : 20, 
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}>
                📦
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{ 
                fontSize: focused ? 24 : 20, 
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}>
                📊
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? '#eff6ff' : 'transparent',
            }}>
              <Text style={{ 
                fontSize: focused ? 24 : 20, 
                opacity: focused ? 1 : 0.6,
                transform: [{ scale: focused ? 1.1 : 1 }]
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