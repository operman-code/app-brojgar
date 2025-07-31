// app/invoice-preview.js
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import InvoicePreviewScreen from '../screens/Invoice/InvoicePreviewScreen';

export default function InvoicePreview() {
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

  return <InvoicePreviewScreen navigation={navigation} route={route} />;
}
