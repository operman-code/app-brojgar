import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import InvoiceScreen from "./screens/Invoice/InvoiceScreen";
import InvoiceTemplateScreen from "./screens/Invoice/InvoiceTemplateScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Main"
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="InvoiceTemplate" component={InvoiceTemplateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
