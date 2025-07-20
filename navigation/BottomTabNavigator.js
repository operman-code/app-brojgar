import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }) => (
  <View className="flex-1 justify-center items-center">
    <Text>{name} Page</Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Sales" children={() => <PlaceholderScreen name="Sales" />} />
      <Tab.Screen name="Purchase" children={() => <PlaceholderScreen name="Purchase" />} />
      <Tab.Screen name="Invoice" children={() => <PlaceholderScreen name="Invoice" />} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;