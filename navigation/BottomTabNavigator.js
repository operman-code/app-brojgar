// navigation/BottomTabNavigator.js
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Import screens
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const { width, height } = Dimensions.get('window');

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBarWrapper}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
          style={styles.tabBarGradient}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel || options.title || route.name;
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <View key={route.key} style={styles.tabItem}>
                  <TouchableOpacity
                    onPress={onPress}
                    style={[
                      styles.tabButton,
                      isFocused && styles.tabButtonActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.iconContainer,
                      isFocused && styles.iconContainerActive
                    ]}>
                      <Text style={[
                        styles.tabIcon,
                        isFocused && styles.tabIconActive
                      ]}>
                        {options.tabBarIcon?.({ focused: isFocused, color: isFocused ? '#3B82F6' : '#64748B', size: 24 })}
                      </Text>
                    </View>
                    <Text style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive
                    ]}>
                      {label}
                    </Text>
                    {isFocused && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </BlurView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
        cardShadowEnabled: true,
        cardOverlayEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Invoice" 
        component={InvoiceScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="InvoiceTemplate" 
        component={InvoiceTemplateScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="InvoicePreview" 
        component={InvoicePreviewScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={GlobalSearchScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tabs Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? '📊' : '📊'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Parties"
        component={PartiesScreen}
        options={{
          tabBarLabel: 'Parties',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? '👥' : '👥'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? '📦' : '📦'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? '📈' : '📈'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? '⚙️' : '⚙️'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const BottomTabNavigator = () => {
  return <MainStack />;
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'transparent',
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabBarGradient: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    position: 'relative',
    minHeight: 50,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});

export default BottomTabNavigator;
