// screens/Dashboard/DashboardScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";

const DashboardScreen = () => {
  // Sample data - in real app, this would come from API/database
  const kpiData = {
    toCollect: 15000,
    toPay: 8500,
    stockValue: 125000,
    weekSales: 35000,
    totalBalance: 85000,
  };

  const recentTransactions = [
    {
      id: "001",
      type: "Sale",
      reference: "INV-001",
      customer: "Rajesh Kumar",
      date: "20-Jul",
      amount: 500,
      status: "Paid",
    },
    {
      id: "002",
      type: "Purchase",
      reference: "PUR-003",
      supplier: "Wholesale Mart",
      date: "19-Jul",
      amount: 1200,
      status: "Pending",
    },
    {
      id: "003",
      type: "Payment",
      reference: "PAY-002",
      customer: "Sunita Devi",
      date: "18-Jul",
      amount: 750,
      status: "Received",
    },
    {
      id: "004",
      type: "Sale",
      reference: "INV-002",
      customer: "Amit Singh",
      date: "17-Jul",
      amount: 1500,
      status: "Pending",
    },
  ];

  const reportShortcuts = [
    { id: 1, title: "Sales Reports", icon: "📊", color: "#10b981" },
    { id: 2, title: "Inventory Reports", icon: "📦", color: "#f59e0b" },
    { id: 3, title: "GST Reports", icon: "📋", color: "#8b5cf6" },
    { id: 4, title: "Party Reports", icon: "👥", color: "#ef4444" },
  ];

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

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionReference}>{item.reference}</Text>
        <Text style={styles.transactionCustomer}>
          {item.customer || item.supplier}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          {formatCurrency(item.amount)}
        </Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderReportShortcut = ({ item }) => (
    <TouchableOpacity style={[styles.reportCard, { borderLeftColor: item.color }]}>
      <Text style={styles.reportIcon}>{item.icon}</Text>
      <Text style={styles.reportTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>Brojgar Business</Text>
            <Text style={styles.headerSubtitle}>Dashboard Overview</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon}>
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { backgroundColor: "#fee2e2" }]}>
                <Text style={styles.kpiLabel}>To Collect</Text>
                <Text style={[styles.kpiValue, { color: "#dc2626" }]}>
                  {formatCurrency(kpiData.toCollect)}
                </Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: "#fef3c7" }]}>
                <Text style={styles.kpiLabel}>To Pay</Text>
                <Text style={[styles.kpiValue, { color: "#d97706" }]}>
                  {formatCurrency(kpiData.toPay)}
                </Text>
              </View>
            </View>
            <View style={styles.kpiRow}>
              <View style={[styles.kpiCard, { backgroundColor: "#d1fae5" }]}>
                <Text style={styles.kpiLabel}>Stock Value</Text>
                <Text style={[styles.kpiValue, { color: "#059669" }]}>
                  {formatCurrency(kpiData.stockValue)}
                </Text>
              </View>
              <View style={[styles.kpiCard, { backgroundColor: "#dbeafe" }]}>
                <Text style={styles.kpiLabel}>Week's Sale</Text>
                <Text style={[styles.kpiValue, { color: "#2563eb" }]}>
                  {formatCurrency(kpiData.weekSales)}
                </Text>
              </View>
            </View>
            <View style={styles.kpiFullWidth}>
              <View style={[styles.kpiCard, { backgroundColor: "#f3f4f6" }]}>
                <Text style={styles.kpiLabel}>Total Balance</Text>
                <Text style={[styles.kpiValue, { color: "#374151", fontSize: 24 }]}>
                  {formatCurrency(kpiData.totalBalance)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#10b981" }]}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>New Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Received Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}>
              <Text style={styles.actionIcon}>🛒</Text>
              <Text style={styles.actionText}>Quick Sale</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Add Stock</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            style={styles.transactionsList}
            scrollEnabled={false}
          />
        </View>

        {/* Report Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Reports</Text>
          <FlatList
            data={reportShortcuts}
            renderItem={renderReportShortcut}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            style={styles.reportsGrid}
            scrollEnabled={false}
            columnWrapperStyle={styles.reportRow}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 18,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  kpiContainer: {
    gap: 12,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
  },
  kpiFullWidth: {
    width: "100%",
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  transactionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionLeft: {
    flex: 1,
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
  reportsGrid: {
    backgroundColor: "transparent",
  },
  reportRow: {
    justifyContent: "space-between",
  },
  reportCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  reportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});

export default DashboardScreen;