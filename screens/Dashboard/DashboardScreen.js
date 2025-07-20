// screens/Dashboard/DashboardScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Brojgar</Text>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;