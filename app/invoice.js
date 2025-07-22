// app/invoice.js
 import React from 'react';
 import { router } from 'expo-router';
 import InvoiceScreen from '../screens/Invoice/InvoiceScreen';
 
 export default function Invoice() {
   const navigation = {
     navigate: (screen, params) => {
       if (screen === "InvoiceTemplate") {
         router.push({
           pathname: '/invoice-template',
           params: params
         });
       } else if (screen === "Dashboard") {
         router.push('/');
       }
     },
     goBack: () => {
       router.back();
     }
   };
 
   return <InvoiceScreen navigation={navigation} />;
 }
