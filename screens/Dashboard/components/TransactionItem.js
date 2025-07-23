// screens/Dashboard/components/TransactionItem.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const TransactionItem = ({ transaction, onPress }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "received":
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "overdue":
      case "failed":
        return "#ef4444";
      case "partial":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
      case "invoice":
        return "💰";
      case "purchase":
        return "🛒";
      case "payment":
        return "💳";
      case "expense":
        return "💸";
      case "stock":
        return "📦";
      default:
        return "📄";
    }
  };

  const getAmountColor = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
      case "invoice":
      case "payment":
        return "#10b981"; // Green for income
      case "purchase":
      case "expense":
        return "#ef4444"; // Red for expense
      default:
        return "#333";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(transaction.type)}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Text style={styles.reference}>{transaction.reference}</Text>
            <Text style={[styles.status, { color: getStatusColor(transaction.status) }]}>
              {transaction.status}
            </Text>
          </View>
          <Text style={styles.party}>
            {transaction.customer || transaction.supplier || transaction.party || 'N/A'}
          </Text>
          <Text style={styles.date}>
            {formatDate(transaction.date || transaction.created_at)}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: getAmountColor(transaction.type) }]}>
          {transaction.type?.toLowerCase() === 'purchase' || transaction.type?.toLowerCase() === 'expense' ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.type}>{transaction.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reference: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  party: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
});

export default TransactionItem;
