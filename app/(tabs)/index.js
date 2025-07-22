// app/(tabs)/index.js
 import React from 'react';
 import { router } from 'expo-router';
 import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
 
 export default function Dashboard() {
   // Create navigation object for expo-router
   const navigation = {
     navigate: (screen, params) => {
       if (screen === "Invoice") {
         router.push('/invoice');
       } else if (screen === "InvoiceTemplate") {
         router.push({
           pathname: '/invoice-template',
           params: params
         });
       }
     },
     goBack: () => {
       router.back();
     }
   };
 
   return <DashboardScreen navigation={navigation} />;
 }
