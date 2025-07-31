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
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Import components
import KPICard from "./components/KPICard";
import TransactionItem from "./components/TransactionItem";
import QuickActionButton from "./components/QuickActionButton";
import NotificationCard from "./components/NotificationCard";

// Import service
import DashboardService from "./services/DashboardService";

const { width, height } = Dimensions.get('window');

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
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
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
    let filtered = recentTransactions;

    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered.slice(0, 8));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    console.log('🚀 Quick action:', action);
    
    switch (action) {
      case 'invoice':
        navigation.navigate('Invoice', { action: 'create' });
        break;
      case 'payment':
        Alert.alert('Payment', 'Payment feature coming soon!');
        break;
      case 'sale':
        Alert.alert('Sale', 'Sale feature coming soon!');
        break;
      case 'stock':
        navigation.navigate('Inventory');
        break;
      case 'customer':
        navigation.navigate('Parties');
        break;
      case 'expenses':
        Alert.alert('Expenses', 'Expenses feature coming soon!');
        break;
      default:
        Alert.alert('Action', `${action} feature coming soon!`);
    }
  };

  const renderKPICards = () => (
    <Animated.View 
      style={[
        styles.kpiSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.kpiGrid}>
        <KPICard
          title="To Collect"
          value={`₹${parseFloat(kpiData.toCollect || 0).toLocaleString('en-IN')}`}
          trend={kpiData.toCollectTrend || 0}
          icon="💰"
          color="#3B82F6"
          onPress={() => Alert.alert('Collections', 'View all collections')}
        />
        <KPICard
          title="To Pay"
          value={`₹${parseFloat(kpiData.toPay || 0).toLocaleString('en-IN')}`}
          trend={kpiData.toPayTrend || 0}
          icon="💳"
          color="#EF4444"
          onPress={() => Alert.alert('Payments', 'View all payments')}
        />
        <KPICard
          title="Stock Value"
          value={`₹${parseFloat(kpiData.stockValue || 0).toLocaleString('en-IN')}`}
          trend={kpiData.stockTrend || 0}
          icon="📦"
          color="#10B981"
          onPress={() => navigation.navigate('Inventory')}
        />
        <KPICard
          title="Week's Sales"
          value={`₹${parseFloat(kpiData.weekSales || 0).toLocaleString('en-IN')}`}
          trend={kpiData.salesTrend || 0}
          icon="📈"
          color="#8B5CF6"
          onPress={() => navigation.navigate('Reports')}
        />
      </View>
    </Animated.View>
  );

  const renderReminders = () => (
    <Animated.View 
      style={[
        styles.remindersSection,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.remindersContainer}
      >
        {reminders.map((reminder, index) => (
          <NotificationCard
            key={reminder.id || index}
            title={reminder.title}
            subtitle={reminder.subtitle}
            icon={reminder.icon}
            color={reminder.color}
            onPress={() => Alert.alert('Reminder', reminder.title)}
          />
        ))}
        {reminders.length === 0 && (
          <View style={styles.emptyReminders}>
            <Text style={styles.emptyRemindersIcon}>🎉</Text>
            <Text style={styles.emptyRemindersText}>All caught up!</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View 
      style={[
        styles.quickActionsSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      
      <View style={styles.quickActionsGrid}>
        <QuickActionButton
          title="Invoice"
          icon="📄"
          color="#3B82F6"
          onPress={() => handleQuickAction('invoice')}
        />
        <QuickActionButton
          title="Payment"
          icon="💳"
          color="#10B981"
          onPress={() => handleQuickAction('payment')}
        />
        <QuickActionButton
          title="Sale"
          icon="🛒"
          color="#F59E0B"
          onPress={() => handleQuickAction('sale')}
        />
        <QuickActionButton
          title="Stock"
          icon="📦"
          color="#8B5CF6"
          onPress={() => handleQuickAction('stock')}
        />
        <QuickActionButton
          title="Customer"
          icon="👥"
          color="#EC4899"
          onPress={() => handleQuickAction('customer')}
        />
        <QuickActionButton
          title="Expenses"
          icon="💰"
          color="#EF4444"
          onPress={() => handleQuickAction('expenses')}
        />
      </View>
    </Animated.View>
  );

  const renderTransactions = () => (
    <Animated.View 
      style={[
        styles.transactionsSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => Alert.alert('Transaction', `View ${item.reference}`)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transactionsList}
      />
      
      {filteredTransactions.length === 0 && (
        <View style={styles.emptyTransactions}>
          <Text style={styles.emptyTransactionsIcon}>📊</Text>
          <Text style={styles.emptyTransactionsText}>No transactions found</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}
      >
        {['overview', 'transactions', 'reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
          <View style={styles.reportsSection}>
            <Text style={styles.sectionTitle}>Reports</Text>
            <Text style={styles.comingSoonText}>Reports feature coming soon!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <StatusBar style="dark" />
      <View style={styles.loadingContent}>
        <Text style={styles.loadingIcon}>📊</Text>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    </SafeAreaView>
  );
}

  return (
  <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    
    {/* Header */}
    <LinearGradient
      colors={['#3B82F6', '#1E40AF']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.businessName}>
              {businessProfile.name || 'Your Business'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.searchButtonIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {renderTabs()}
        {renderContent()}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScrollContainer: {
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  kpiSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  remindersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  remindersContainer: {
    paddingRight: 20,
  },
  emptyReminders: {
    width: 200,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyRemindersIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyRemindersText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  transactionsList: {
    paddingBottom: 20,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTransactionsIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  reportsSection: {
    padding: 20,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 20,
  },
});

export default DashboardScreen;
