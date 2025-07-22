// app/(tabs)/inventory.js
 import React from 'react';
 import { router } from 'expo-router';
 import InventoryScreen from '../../screens/Inventory/InventoryScreen';
 
 export default function Inventory() {
   // Create navigation object for expo-router
   const navigation = {
     navigate: (screen, params) => {
       if (screen === "Dashboard") {
         router.push('/');
       }
     },
     goBack: () => {
       router.back();
     }
   };
 
   return <InventoryScreen navigation={navigation} />;
 }
