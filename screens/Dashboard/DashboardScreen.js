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
  // Enhanced state management
  const [kpiData, setKpiData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({});
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadDashboardData();
    
    // Enhanced animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [recentTransactions, searchQuery]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        kpiResult,
        transactionsResult,
        remindersResult,
        notificationsResult,
        chartResult,
        profileResult
      ] = await Promise.all([
        DashboardService.getKPIData(),
        DashboardService.getRecentTransactions(),
        DashboardService.getReminders(),
        DashboardService.getNotifications(),
        DashboardService.getSalesChartData(),
        DashboardService.getBusinessProfile()
      ]);

      setKpiData(kpiResult);
      setRecentTransactions(transactionsResult);
      setReminders(remindersResult);
      setNotifications(notificationsResult);
      setSalesChartData(chartResult);
      setBusinessProfile(profileResult);
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (searchQuery.trim() === "") {
      setFilteredTransactions(recentTransactions);
    } else {
      const filtered = recentTransactions.filter(transaction =>
        transaction.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newSale':
        navigation.navigate('Invoice');
        break;
      case 'addItem':
        navigation.navigate('Inventory', { action: 'add' });
        break;
      case 'newCustomer':
        navigation.navigate('Parties', { action: 'add', type: 'customer' });
        break;
      case 'receivePayment':
        Alert.alert("Coming Soon", "Payment collection feature will be available soon");
        break;
      case 'newInvoice':
        navigation.navigate('Invoice');
        break;
      case 'viewReports':
        navigation.navigate('Reports');
        break;
      default:
        Alert.alert("Feature", `${action} feature coming soon`);
    }
  };

  const renderKPICards = () => (
    <View style={styles.kpiContainer}>
      <KPICard
        title="To Collect"
        value={kpiData.toCollect || 0}
        change={kpiData.toCollectTrend}
        icon="💰"
        color="#10b981"
      />
      <KPICard
        title="To Pay"
        value={kpiData.toPay || 0}
        change={kpiData.toPayTrend}
        icon="💳"
        color="#ef4444"
      />
      <KPICard
        title="Stock Value"
        value={kpiData.stockValue || 0}
        change={kpiData.stockTrend}
        icon="📦"
        color="#3b82f6"
      />
      <KPICard
        title="This Week"
        value={kpiData.weekSales || 0}
        change={kpiData.salesTrend}
        icon="📈"
        color="#8b5cf6"
      />
    </View>
  );

  const renderReminders = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {reminders.length > 0 ? (
        <View>
          {reminders.slice(0, 3).map((item) => (
            <View key={item.id.toString()} style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <View style={[styles.reminderIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.reminderIconText}>{item.icon}</Text>
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{item.title}</Text>
                  <Text style={styles.reminderSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.reminderAmount}>₹{item.amount?.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No pending reminders</Text>
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {[
          { id: '1', title: 'New Sale', icon: '💰', action: 'newSale', color: '#10b981' },
          { id: '2', title: 'Add Item', icon: '📦', action: 'addItem', color: '#3b82f6' },
          { id: '3', title: 'New Customer', icon: '👤', action: 'newCustomer', color: '#8b5cf6' },
          { id: '4', title: 'Payment', icon: '💳', action: 'receivePayment', color: '#f59e0b' },
          { id: '5', title: 'Invoice', icon: '🧾', action: 'newInvoice', color: '#ef4444' },
          { id: '6', title: 'Reports', icon: '📊', action: 'viewReports', color: '#06b6d4' },
        ].map((action) => (
          <QuickActionButton
            key={action.id}
            title={action.title}
            icon={action.icon}
            color={action.color}
            onPress={() => handleQuickAction(action.action)}
          />
        ))}
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {filteredTransactions.length > 0 ? (
        <View>
          {filteredTransactions.slice(0, 5).map((item) => (
            <TransactionItem
            key={item.id.toString()}
              transaction={item}
              onPress={() => {
                // Handle transaction press
                Alert.alert("Transaction", `View ${item.type} details`);
              }}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No matching transactions' : 'No recent transactions'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'overview', title: 'Overview', icon: '📊' },
        { id: 'transactions', title: 'Transactions', icon: '📋' },
        { id: 'reports', title: 'Reports', icon: '📈' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {renderKPICards()}
            {renderReminders()}
            {renderQuickActions()}
          </>
        );
      case 'transactions':
        return renderTransactions();
      case 'reports':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Quick Reports</Text>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <Text style={styles.reportButtonText}>View Detailed Reports</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.businessName}>{businessProfile.businessName || 'Brojgar Business'}</Text>
      </View>

        {/* Tabs */}
        {renderTabs()}

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderIconText: {
    fontSize: 18,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  reminderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  reportButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
