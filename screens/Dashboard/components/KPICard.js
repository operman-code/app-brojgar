import React from "react";
import { View, Text, StyleSheet } from "react-native";

const KPICard = ({ label, value, backgroundColor, textColor, isLarge = false }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[
        styles.value, 
        { color: textColor },
        isLarge && styles.largeValue
      ]}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  largeValue: {
    fontSize: 24,
  },
});

export default KPICard;