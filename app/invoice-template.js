// app/invoice-template.js
 import React from 'react';
 import { router, useLocalSearchParams } from 'expo-router';
 import InvoiceTemplateScreen from '../screens/Invoice/InvoiceTemplateScreen';
 
 export default function InvoiceTemplate() {
   const params = useLocalSearchParams();
   
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
 
   const route = {
     params: params
   };
 
   return <InvoiceTemplateScreen navigation={navigation} route={route} />;
 }
