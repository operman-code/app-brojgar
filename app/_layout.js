// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="invoice" />
      <Stack.Screen name="invoice-template" />
      <Stack.Screen name="invoice-preview" />
    </Stack>
  );
}
