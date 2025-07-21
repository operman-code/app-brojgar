import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const chartWidth = width - 80; // Account for padding

const ChartCard = ({ data }) => {
  if (!data || !data.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.sales));
  const minValue = Math.min(...data.map(item => item.sales));
  const range = maxValue - minValue || 1;

  const renderBar = (item, index) => {
    const normalizedHeight = ((item.sales - minValue) / range) * 100 + 20; // Min height of 20
    const barHeight = Math.max(normalizedHeight, 30); // Ensure minimum visible height
    
    return (
      <View key={index} style={styles.barContainer}>
        <View style={styles.barWrapper}>
          <View 
            style={[
              styles.bar, 
              { 
                height: barHeight,
                backgroundColor: item.sales >= (maxValue * 0.7) ? "#10b981" : 
                               item.sales >= (maxValue * 0.4) ? "#f59e0b" : "#ef4444"
              }
            ]}
          />
        </View>
        <Text style={styles.dayLabel}>{item.day}</Text>
        <Text style={styles.valueLabel}>₹{item.sales / 1000}k</Text>
      </View>
    );
  };

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const averageSales = totalSales / data.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.totalLabel}>Total Sales</Text>
          <Text style={styles.totalValue}>₹{(totalSales / 1000).toFixed(1)}k</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg</Text>
            <Text style={styles.statValue}>₹{(averageSales / 1000).toFixed(1)}k</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>₹{(maxValue / 1000).toFixed(1)}k</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => renderBar(item, index))}
        </View>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  chartContainer: {
    height: 120,
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  barWrapper: {
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 20,
  },
  dayLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  valueLabel: {
    fontSize: 10,
    color: "#9ca3af",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  noDataText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 16,
    padding: 40,
  },
});

export default ChartCard;