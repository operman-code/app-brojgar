// screens/Dashboard/components/QuickActionButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const QuickActionButton = ({ icon, title, onPress, color = "#1e40af" }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default QuickActionButton;
