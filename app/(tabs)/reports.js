// app/(tabs)/reports.js
 import React from 'react';
 import { router } from 'expo-router';
 import ReportsScreen from '../../screens/Reports/ReportsScreen';
 
 export default function Reports() {
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
 
   return <ReportsScreen navigation={navigation} />;
 }
