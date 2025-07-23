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
  // State management with database integration
  const [kpiData, setKpiData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [reportShortcuts] = useState([
    { id: '1', title: 'Sales Report', icon: '📊', screen: 'Reports' },
    { id: '2', title: 'Inventory', icon: '📦', screen: 'Inventory' },
    { id: '3', title: 'Customers', icon: '👥', screen: 'Parties' },
    { id: '4', title: 'Analytics', icon: '📈', screen: 'Reports' }
  ]);
  const [quickActions] = useState([
    { id: '1', title: 'New Sale', icon: '💰', action: 'newSale' },
    { id: '2', title: 'Add Item', icon: '📦', action: 'addItem' },
    { id: '3', title: 'New Customer', icon: '👤', action: 'newCustomer' },
    { id: '4', title: 'Receive Payment', icon: '💳', action: 'receivePayment' },
    { id: '5', title: 'New Invoice', icon: '🧾', action: 'newInvoice' }
  ]);
  const [businessProfile] = useState({
    businessName: "Brojgar Business",
    ownerName: "Business Owner",
    gstNumber: "27XXXXX1234X1Z5",
    phone: "+91 98765 43210"
  });
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [salesChartData] = useState([
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 }
  ]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isQuickSiteOpen, setIsQuickSiteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const quickMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    
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

  // Load data from database
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiResult, transactionsResult, summaryResult, notificationsResult] = await Promise.all([
        DashboardService.getKPIData(),
        DashboardService.getRecentTransactions(),
        DashboardService.getDashboardSummary(),
        DashboardService.getNotifications()
      ]);

      setKpiData(kpiResult);
      setRecentTransactions(transactionsResult);
      setDashboardSummary(summaryResult);
      setNotifications(notificationsResult);
      setFilteredTransactions(transactionsResult);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleProfilePress = () => {
    Alert.alert(
      "Business Profile",
      `${businessProfile.businessName}\nOwner: ${businessProfile.ownerName}\nGST: ${businessProfile.gstNumber}\nPhone: ${businessProfile.phone}`,
      [{ text: "OK" }]
    );
  };

  const handleReportPress = (screen) => {
    navigation.navigate(screen);
  };

  const toggleQuickSite = () => {
    const toValue = isQuickSiteOpen ? 0 : 1;
    setIsQuickSiteOpen(!isQuickSiteOpen);
    
    Animated.spring(quickMenuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleQuickAction = (action) => {
    toggleQuickSite();
    
    switch (action) {
      case 'newSale':
      case 'newInvoice':
        navigation.navigate('Invoice');
        break;
      case 'addItem':
        navigation.navigate('Inventory');
        break;
      case 'newCustomer':
        navigation.navigate('Parties');
        break;
      case 'receivePayment':
        handleReceivePayment();
        break;
      default:
        Alert.alert('Info', `${action} feature coming soon!`);
    }
  };

  const handleReceivePayment = () => {
    Alert.alert(
      'Receive Payment',
      'Choose payment method:',
      [
        { text: 'Cash', onPress: () => Alert.alert('Payment', 'Cash payment recorded') },
        { text: 'Digital', onPress: () => Alert.alert('Payment', 'Digital payment recorded') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleBillInvoice = () => {
    navigation.navigate('Invoice');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleProfilePress} style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>🏢</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.businessName}>{businessProfile.businessName}</Text>
          <Text style={styles.ownerName}>Welcome back, {businessProfile.ownerName}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.notificationBell}>
        <Text style={styles.notificationIcon}>🔔</Text>
        {notifications.length > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderKPICards = () => (
    <View style={styles.kpiContainer}>
      <Text style={styles.sectionTitle}>Business Overview</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScrollContent}
      >
        <KPICard
          title="Total Sales"
          value={DashboardService.formatCurrency(kpiData.totalSales || 0)}
          change="+12.5%"
          icon="💰"
          color="#4CAF50"
        />
        <KPICard
          title="Outstanding"
          value={DashboardService.formatCurrency(kpiData.totalOutstanding || 0)}
          change="-3.2%"
          icon="⏰"
          color="#FF9800"
        />
        <KPICard
          title="Inventory Value"
          value={DashboardService.formatCurrency(kpiData.inventoryValue || 0)}
          change="+8.1%"
          icon="📦"
          color="#2196F3"
        />
        <KPICard
          title="Net Profit"
          value={DashboardService.formatCurrency(kpiData.netProfit || 0)}
          change="+15.3%"
          icon="📈"
          color="#9C27B0"
        />
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            title={action.title}
            icon={action.icon}
            onPress={() => handleQuickAction(action.action)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.transactionsContainer}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <FlatList
        data={filteredTransactions.slice(0, 8)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => Alert.alert('Transaction', `${item.type}: ${item.reference}`)}
          />
        )}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );

  const renderReportsShortcuts = () => (
    <View style={styles.reportsContainer}>
      <Text style={styles.sectionTitle}>Reports & Analytics</Text>
      <View style={styles.reportsGrid}>
        {reportShortcuts.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => handleReportPress(report.screen)}
          >
            <Text style={styles.reportIcon}>{report.icon}</Text>
            <Text style={styles.reportTitle}>{report.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNotifications = () => (
    notifications.length > 0 && (
      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {notifications.slice(0, 3).map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => Alert.alert('Notification', notification.message)}
          />
        ))}
      </View>
    )
  );

  const renderQuickSiteMenu = () => (
    <Animated.View
      style={[
        styles.quickSiteMenu,
        {
          opacity: quickMenuAnim,
          transform: [
            {
              scale: quickMenuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents={isQuickSiteOpen ? 'auto' : 'none'}
    >
      {quickActions.map((action, index) => (
        <Animated.View
          key={action.id}
          style={[
            styles.quickSiteItem,
            {
              transform: [
                {
                  translateY: quickMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.quickSiteButton}
            onPress={() => handleQuickAction(action.action)}
          >
            <Text style={styles.quickSiteIcon}>{action.icon}</Text>
            <Text style={styles.quickSiteText}>{action.title}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1e40af"]}
              tintColor="#1e40af"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderKPICards()}
          {renderQuickActions()}
          {renderRecentTransactions()}
          {renderReportsShortcuts()}
          {renderNotifications()}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {/* Bottom Navigation Bar - Original Design */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity 
          style={styles.receivedPaymentButton}
          onPress={handleReceivePayment}
        >
          <Text style={styles.bottomButtonText}>Received Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickSiteButton} 
          onPress={toggleQuickSite}
        >
          <Text style={styles.quickSiteButtonText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.billInvoiceButton}
          onPress={handleBillInvoice}
        >
          <Text style={styles.bottomButtonText}>Bill / Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* QuickSite Menu Overlay */}
      {renderQuickSiteMenu()}
      
      {/* Overlay for closing quicksite */}
      {isQuickSiteOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleQuickSite}
          activeOpacity={1}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  
  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileIconText: {
    fontSize: 20,
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ownerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  notificationBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // KPI Cards
  kpiContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  kpiScrollContent: {
    paddingRight: 20,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickActionsScroll: {
    paddingRight: 20,
  },

  // Transactions
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    fontSize: 16,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },

  // Reports
  reportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reportCard: {
    width: (width - 50) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reportIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  // Notifications
  notificationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  // Bottom Navigation - Original Design
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receivedPaymentButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  billInvoiceButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickSiteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  quickSiteButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // QuickSite Menu
  quickSiteMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
  },
  quickSiteItem: {
    marginBottom: 15,
  },
  quickSiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  quickSiteIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  quickSiteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen;
