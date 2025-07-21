// screens/Dashboard/DashboardScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";

// Import components
import KPICard from "./components/KPICard";
import TransactionItem from "./components/TransactionItem";
import QuickActionButton from "./components/QuickActionButton";
import NotificationCard from "./components/NotificationCard";

// Import service
import DashboardService from "./services/DashboardService";

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  // State management
  const [kpiData, setKpiData] = useState(DashboardService.getKPIData());
  const [recentTransactions, setRecentTransactions] = useState(DashboardService.getRecentTransactions());
  const [reportShortcuts] = useState(DashboardService.getReportShortcuts());
  const [quickActions] = useState(DashboardService.getQuickActions());
  const [businessProfile] = useState(DashboardService.getBusinessProfile());
  const [dashboardSummary, setDashboardSummary] = useState(DashboardService.getDashboardSummary());
  const [notifications, setNotifications] = useState(DashboardService.getNotifications());
  const [salesChartData] = useState(DashboardService.getSalesChartData());
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState(recentTransactions);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate dashboard on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Filter transactions based on search query
    if (searchQuery.trim() === "") {
      setFilteredTransactions(recentTransactions);
    } else {
      const filtered = recentTransactions.filter(transaction =>
        transaction.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, recentTransactions]);

  // Event handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setKpiData(DashboardService.getKPIData());
      setRecentTransactions(DashboardService.getRecentTransactions());
      setDashboardSummary(DashboardService.getDashboardSummary());
      setNotifications(DashboardService.getNotifications());
      setRefreshing(false);
    }, 1500);
  };

  const handleProfilePress = () => {
    Alert.alert(
      "Business Profile",
      `${businessProfile.businessName}\nOwner: ${businessProfile.ownerName}\nGST: ${businessProfile.gstNumber}\nPhone: ${businessProfile.phone}`,
      [{ text: "OK" }]
    );
  };

  const handleQuickAction = (action) => {
    const result = DashboardService.handleQuickAction(action);
    Alert.alert("Action", result.message, [{ text: "OK" }]);
  };

  const handleViewAllTransactions = () => {
    Alert.alert("Navigation", "Navigating to All Transactions", [{ text: "OK" }]);
  };

  const handleReportPress = (report) => {
    Alert.alert("Report", `Opening ${report.title}`, [{ text: "OK" }]);
  };

  const handleNotificationPress = (notification) => {
    Alert.alert(
      notification.title,
      notification.message,
      [
        { text: "Dismiss", style: "cancel" },
        { text: notification.actionLabel || "OK" }
      ]
    );
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      `Transaction Details`,
      `${transaction.reference}\nCustomer: ${transaction.customer || transaction.supplier}\nAmount: ${DashboardService.formatCurrency(transaction.amount)}\nStatus: ${transaction.status}`,
      [{ text: "OK" }]
    );
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

  const renderNotification = ({ item }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onDismiss={() => dismissNotification(item.id)}
    />
  );

  const renderTabButton = (tabId, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
    >
      <Text style={[styles.tabIcon, activeTab === tabId && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabTitle, activeTab === tabId && styles.activeTabTitle]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.businessName}>{businessProfile.businessName}</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {businessProfile.ownerName}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: "#10b981" }]} />
            <Text style={styles.summaryText}>{dashboardSummary.statusMessage}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={handleProfilePress}>
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("overview", "Overview", "📊")}
        {renderTabButton("transactions", "Activity", "💳")}
        {renderTabButton("reports", "Reports", "📈")}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Notifications */}
          {notifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔔 Important Alerts</Text>
              <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.notificationsList}
              />
            </View>
          )}

          {activeTab === "overview" && (
            <>
              {/* KPI Summary Cards */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Business Overview</Text>
                <View style={styles.kpiContainer}>
                  <View style={styles.kpiRow}>
                    <KPICard 
                      label="To Collect"
                      value={kpiData.toCollect}
                      backgroundColor="#fee2e2"
                      textColor="#dc2626"
                      trend={kpiData.toCollectTrend}
                    />
                    <KPICard 
                      label="To Pay"
                      value={kpiData.toPay}
                      backgroundColor="#fef3c7"
                      textColor="#d97706"
                      trend={kpiData.toPayTrend}
                    />
                  </View>
                  <View style={styles.kpiRow}>
                    <KPICard 
                      label="Stock Value"
                      value={kpiData.stockValue}
                      backgroundColor="#e0f2fe"
                      textColor="#0284c7"
                      trend={kpiData.stockTrend}
                    />
                    <KPICard 
                      label="Week Sales"
                      value={kpiData.weekSales}
                      backgroundColor="#d1fae5"
                      textColor="#059669"
                      trend={kpiData.salesTrend}
                    />
                  </View>
                  <View style={styles.kpiRow}>
                    <KPICard 
                      label="Total Balance"
                      value={kpiData.totalBalance}
                      backgroundColor="#f3e8ff"
                      textColor="#7c3aed"
                      trend={kpiData.balanceTrend}
                      isLarge={true}
                    />
                  </View>
                </View>
              </View>


            </>
          )}

          {activeTab === "transactions" && (
            <>
              {/* Search Bar */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔍 Search Transactions</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by customer, reference, or type..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9ca3af"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setSearchQuery("")}
                    >
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Recent Transactions */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    💳 Recent Activity ({filteredTransactions.length})
                  </Text>
                  <TouchableOpacity onPress={handleViewAllTransactions}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.transactionsList}>
                  <FlatList
                    data={filteredTransactions.slice(0, 8)}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </>
          )}

          {activeTab === "reports" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Quick Reports</Text>
              <FlatList
                data={reportShortcuts}
                renderItem={renderReportShortcut}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                style={styles.reportsGrid}
                scrollEnabled={false}
                columnWrapperStyle={styles.reportRow}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

        </Animated.View>
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity
          style={[styles.floatingButton, styles.secondaryButton]}
          onPress={() => handleQuickAction('receive_payment')}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonIcon}>💰</Text>
          <Text style={styles.floatingButtonText}>Receive Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.floatingButton, styles.primaryButton]}
          onPress={() => handleQuickAction('new_invoice')}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonIcon}>📝</Text>
          <Text style={styles.floatingButtonText}>New Invoice</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  summaryText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  profileIconText: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: "#eff6ff",
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 18,
  },
  tabTitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTabTitle: {
    color: "#2563eb",
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  notificationsList: {
    marginTop: 8,
  },
  kpiContainer: {
    gap: 12,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "bold",
  },
  transactionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
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
  floatingButtonsContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 12,
  },
  floatingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minWidth: 140,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  secondaryButton: {
    backgroundColor: "#10b981",
  },
  floatingButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  floatingButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DashboardScreen;