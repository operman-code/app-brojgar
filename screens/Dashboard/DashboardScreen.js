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
  Alert,
} from "react-native";
import KPICard from "./components/KPICard";
import QuickActionButton from "./components/QuickActionButton";
import TransactionItem from "./components/TransactionItem";
import DashboardService from "./services/DashboardService";

const DashboardScreen = () => {
  // Get data from service
  const kpiData = DashboardService.getKPIData();
  const recentTransactions = DashboardService.getRecentTransactions();
  const reportShortcuts = DashboardService.getReportShortcuts();
  const quickActions = DashboardService.getQuickActions();
  const businessProfile = DashboardService.getBusinessProfile();
  const dashboardSummary = DashboardService.getDashboardSummary();

  // Event handlers
  const handleQuickAction = (action) => {
    const result = DashboardService.handleQuickAction(action);
    Alert.alert("Action", result.message);
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      "Transaction Details",
      `${transaction.type}: ${transaction.reference}\nAmount: ₹${transaction.amount.toLocaleString("en-IN")}\nStatus: ${transaction.status}`
    );
  };

  const handleReportPress = (report) => {
    Alert.alert("Report", `Opening ${report.title}`);
  };

  const handleViewAllTransactions = () => {
    Alert.alert("Transactions", "Opening all transactions view");
  };

  const handleProfilePress = () => {
    Alert.alert("Profile", `Business: ${businessProfile.businessName}\nOwner: ${businessProfile.ownerName}`);
  };

  const renderTransactionItem = ({ item }) => (
    <TransactionItem 
      transaction={item} 
      onPress={() => handleTransactionPress(item)}
    />
  );

  const renderReportShortcut = ({ item }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { borderLeftColor: item.color }]}
      onPress={() => handleReportPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.reportIcon}>{item.icon}</Text>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{businessProfile.businessName}</Text>
            <Text style={styles.headerSubtitle}>Dashboard Overview</Text>
            <Text style={styles.summaryText}>{dashboardSummary.statusMessage}</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon} onPress={handleProfilePress}>
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>

                  {/* KPI Summary Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Overview</Text>
            <View style={styles.kpiContainer}>
              <View style={styles.kpiRow}>
                <KPICard 
                  label="To Collect"
                  value={kpiData.toCollect}
                  backgroundColor="#fee2e2"
                  textColor="#dc2626"
                />
                <KPICard 
                  label="To Pay"
                  value={kpiData.toPay}
                  backgroundColor="#fef3c7"
                  textColor="#d97706"
                />
              </View>
              <View style={styles.kpiRow}>
                <KPICard 
                  label="Stock Value"
                  value={kpiData.stockValue}
                  backgroundColor="#d1fae5"
                  textColor="#059669"
                />
                <KPICard 
                  label="Week's Sale"
                  value={kpiData.weekSales}
                  backgroundColor="#dbeafe"
                  textColor="#2563eb"
                />
              </View>
              <View style={styles.kpiFullWidth}>
                <KPICard 
                  label="Total Balance"
                  value={kpiData.totalBalance}
                  backgroundColor="#f3f4f6"
                  textColor="#374151"
                  isLarge={true}
                />
              </View>
            </View>
          </View>

                  {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.id}
                  icon={action.icon}
                  title={action.title}
                  backgroundColor={action.backgroundColor}
                  onPress={() => handleQuickAction(action.action)}
                />
              ))}
            </View>
          </View>

                  {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={handleViewAllTransactions}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentTransactions.slice(0, 4)} // Show only first 4 transactions
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
  summaryText: {
    fontSize: 12,
    color: "#059669",
    marginTop: 4,
    fontWeight: "500",
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
  reportDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
});

export default DashboardScreen;