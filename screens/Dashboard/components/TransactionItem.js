import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const TransactionItem = ({ transaction, onPress }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
      case "Received":
        return "#10b981";
      case "Pending":
        return "#f59e0b";
      case "Overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Sale":
        return "💰";
      case "Purchase":
        return "🛒";
      case "Payment":
        return "💳";
      default:
        return "📄";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View style={styles.transactionHeader}>
          <Text style={styles.typeIcon}>{getTypeIcon(transaction.type)}</Text>
          <Text style={styles.transactionType}>{transaction.type}</Text>
        </View>
        <Text style={styles.transactionReference}>{transaction.reference}</Text>
        <Text style={styles.transactionCustomer}>
          {transaction.customer || transaction.supplier}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) },
          ]}
        >
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  transactionLeft: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  transactionReference: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  transactionCustomer: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default TransactionItem;