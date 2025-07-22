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

const DashboardScreen = ({ navigation }) => {
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
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const quickMenuAnim = useRef(new Animated.Value(0)).current;

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
    if (action === 'new_invoice') {
      toggleQuickMenu(); // Close menu first
      if (navigation && navigation.navigate) {
        navigation.navigate("Invoice");
      } else {
        Alert.alert("Navigation", "Invoice screen will open here");
      }
      return;
    }
    
    const result = DashboardService.handleQuickAction(action);
    Alert.alert("Action", result.message, [{ text: "OK" }]);

  };

  const toggleQuickMenu = () => {
    const toValue = isQuickMenuOpen ? 0 : 1;
    setIsQuickMenuOpen(!isQuickMenuOpen);
    
    Animated.spring(quickMenuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
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
      activeOpacity={0.7}
    >
      <View style={[styles.tabIconContainer, activeTab === tabId && styles.activeTabIconContainer]}>
        <Text style={[styles.tabIcon, activeTab === tabId && styles.activeTabIcon]}>{icon}</Text>
      </View>
      <Text style={[styles.tabTitle, activeTab === tabId && styles.activeTabTitle]}>{title}</Text>
      {activeTab === tabId && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{businessProfile.businessName}</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {businessProfile.ownerName}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: "#10b981" }]} />
              <Text style={styles.summaryText}>{dashboardSummary.statusMessage}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={() => Alert.alert("Notifications", "Feature coming soon!")}>
              <Text style={styles.notificationIcon}>🔔</Text>
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileIconContainer} onPress={handleProfilePress}>
              <Text style={styles.profileIconText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      
      {/* Quick Action Circle */}
      <View style={styles.quickActionContainer}>
        {/* Quick Action Options - Animated */}
        {isQuickMenuOpen && (
          <Animated.View 
            style={[
              styles.quickActionOptions,
              {
                opacity: quickMenuAnim,
                transform: [{
                  scale: quickMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.quickActionOption, { backgroundColor: '#10b981' }]}
              onPress={() => handleQuickAction('new_invoice')}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionLabel}>New Invoice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionOption, { backgroundColor: '#3b82f6' }]}
              onPress={() => handleQuickAction('receive_payment')}
            >
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionLabel}>Receive Payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionOption, { backgroundColor: '#f59e0b' }]}
              onPress={() => handleQuickAction('add_expense')}
            >
              <Text style={styles.quickActionIcon}>💳</Text>
              <Text style={styles.quickActionLabel}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionOption, { backgroundColor: '#8b5cf6' }]}
              onPress={() => handleQuickAction('add_customer')}
            >
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionLabel}>Add Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionOption, { backgroundColor: '#ef4444' }]}
              onPress={() => handleQuickAction('inventory_alert')}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionLabel}>Stock Alert</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Main Quick Action Button */}
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            isQuickMenuOpen && styles.quickActionButtonOpen
          ]}
          onPress={toggleQuickMenu}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: quickMenuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                })
              }]
            }}
          >
            <Text style={styles.quickActionMainIcon}>+</Text>
          </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    backgroundColor: "#1e40af",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0f2fe",
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
    color: "#e0f2fe",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: "#eff6ff",
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  activeTabIconContainer: {
    backgroundColor: "#3b82f6",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 4,
    width: 20,
    height: 3,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  tabIcon: {
    fontSize: 18,
  },
  activeTabIcon: {
    fontSize: 18,
    color: "#ffffff",
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
  quickActionContainer: {
    position: "absolute",

    right: 20,
    alignItems: "flex-end",
  },
  quickActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  quickActionButtonOpen: {
    backgroundColor: "#1e40af",
  },
  quickActionMainIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  quickActionOptions: {
    position: "absolute",
    bottom: 70,
    right: 0,
    alignItems: "flex-end",
    gap: 12,
  },

  quickActionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    minWidth: 140,
  },
  quickActionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  quickActionLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default DashboardScreen;
