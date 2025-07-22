// app/(tabs)/_layout.js
 import React from 'react';
 import { Tabs } from 'expo-router';
 import { View, Text, TouchableOpacity } from 'react-native';
 
 export default function TabLayout() {
   return (
     <Tabs
       screenOptions={{
         headerShown: false,
         tabBarStyle: {
           borderTopWidth: 0,
           height: 80,
           borderTopLeftRadius: 20,
           borderTopRightRadius: 20,
           shadowOffset: { width: 0, height: -3 },
           shadowOpacity: 0.1,
           shadowRadius: 6,
           elevation: 10,
           backgroundColor: '#ffffff',
           paddingBottom: 10,
           paddingTop: 10,
         },
         tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={0.7} />,
         tabBarActiveTintColor: '#3b82f6',
         tabBarInactiveTintColor: '#9ca3af',
         tabBarLabelStyle: {
           fontSize: 12,
           fontWeight: '600',
           marginTop: 4,
         },
       }}
     >
       <Tabs.Screen
         name="index"
         options={{
           title: 'Dashboard',
           tabBarIcon: ({ focused, color }) => (
             <View style={{
               width: 32,
               height: 32,
               borderRadius: 16,
               backgroundColor: focused ? '#eff6ff' : 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               transform: [{ scale: focused ? 1.1 : 1 }],
             }}>
               <Text style={{ fontSize: 18, color }}>📊</Text>
             </View>
           ),
         }}
       />
       <Tabs.Screen
         name="parties"
         options={{
           title: 'Parties',
           tabBarIcon: ({ focused, color }) => (
             <View style={{
               width: 32,
               height: 32,
               borderRadius: 16,
               backgroundColor: focused ? '#eff6ff' : 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               transform: [{ scale: focused ? 1.1 : 1 }],
             }}>
               <Text style={{ fontSize: 18, color }}>👥</Text>
             </View>
           ),
         }}
       />
       <Tabs.Screen
         name="inventory"
         options={{
           title: 'Inventory',
           tabBarIcon: ({ focused, color }) => (
             <View style={{
               width: 32,
               height: 32,
               borderRadius: 16,
               backgroundColor: focused ? '#eff6ff' : 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               transform: [{ scale: focused ? 1.1 : 1 }],
             }}>
               <Text style={{ fontSize: 18, color }}>📦</Text>
             </View>
           ),
         }}
       />
       <Tabs.Screen
         name="reports"
         options={{
           title: 'Reports',
           tabBarIcon: ({ focused, color }) => (
             <View style={{
               width: 32,
               height: 32,
               borderRadius: 16,
               backgroundColor: focused ? '#eff6ff' : 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               transform: [{ scale: focused ? 1.1 : 1 }],
             }}>
               <Text style={{ fontSize: 18, color }}>📈</Text>
             </View>
           ),
         }}
       />
       <Tabs.Screen
         name="settings"
         options={{
           title: 'Settings',
           tabBarIcon: ({ focused, color }) => (
             <View style={{
               width: 32,
               height: 32,
               borderRadius: 16,
               backgroundColor: focused ? '#eff6ff' : 'transparent',
               justifyContent: 'center',
               alignItems: 'center',
               transform: [{ scale: focused ? 1.1 : 1 }],
             }}>
               <Text style={{ fontSize: 18, color }}>⚙️</Text>
             </View>
           ),
         }}
       />
     </Tabs>
   );
 }
