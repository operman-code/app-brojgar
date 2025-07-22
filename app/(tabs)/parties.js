// app/(tabs)/parties.js
 import React from 'react';
 import { router } from 'expo-router';
 import PartiesScreen from '../../screens/Parties/PartiesScreen';
 
 export default function Parties() {
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
 
   return <PartiesScreen navigation={navigation} />;
 }
