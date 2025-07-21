import React from "react";
import { View, Text, StyleSheet } from "react-native";

const KPICard = ({ label, value, backgroundColor, textColor, isLarge = false, trend }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getTrendIcon = (trendValue) => {
    if (!trendValue) return null;
    if (trendValue > 0) return "📈";
    if (trendValue < 0) return "📉";
    return "📊";
  };

  const getTrendColor = (trendValue) => {
    if (!trendValue) return "#6b7280";
    if (trendValue > 0) return "#10b981";
    if (trendValue < 0) return "#ef4444";
    return "#6b7280";
  };

  return (
    <View style={[styles.card, { backgroundColor }, isLarge && styles.largeCard]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendIcon}>{getTrendIcon(trend)}</Text>
            <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.value, 
        { color: textColor },
        isLarge && styles.largeValue
      ]}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </Text>
      {trend !== undefined && (
        <Text style={styles.trendLabel}>vs last period</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: 100,
    justifyContent: "center",
  },
  largeCard: {
    minHeight: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "600",
  },
  trendLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
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