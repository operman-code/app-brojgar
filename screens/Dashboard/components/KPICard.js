// screens/Dashboard/components/KPICard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const KPICard = ({ title, value, change, icon, color }) => {
  const formatCurrency = (amount) => {
    if (typeof amount === 'string' && amount.startsWith('₹')) {
      return amount; // Already formatted
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getTrendColor = (changeStr) => {
    if (!changeStr) return "#6b7280";
    if (changeStr.startsWith('+')) return "#10b981";
    if (changeStr.startsWith('-')) return "#ef4444";
    return "#6b7280";
  };

  const getTrendIcon = (changeStr) => {
    if (!changeStr) return "📊";
    if (changeStr.startsWith('+')) return "📈";
    if (changeStr.startsWith('-')) return "📉";
    return "📊";
  };

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {change && (
          <View style={styles.changeContainer}>
            <Text style={styles.changeIcon}>{getTrendIcon(change)}</Text>
            <Text style={[styles.changeText, { color: getTrendColor(change) }]}>
              {change}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 15,
    minWidth: 200,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});

export default KPICard;
