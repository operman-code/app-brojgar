// app/(tabs)/settings.js
 import React from 'react';
 import { router } from 'expo-router';
 import SettingsScreen from '../../screens/Settings/SettingsScreen';
 
 export default function Settings() {
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
 
   return <SettingsScreen navigation={navigation} />;
 }
