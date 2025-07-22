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
  const [kpiData, setKpiData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [businessMetrics, setBusinessMetrics] = useState({});
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isQuickSiteOpen, setIsQuickSiteOpen] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const quickMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Animate dashboard on load
    if (!loading) {
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
    }
  }, [loading]);

  useEffect(() => {
    // Filter transactions based on search query
    if (searchQuery.trim() === "") {
      setFilteredTransactions(recentTransactions);
    } else {
      const filtered = recentTransactions.filter(transaction =>
        transaction.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, recentTransactions]);

  // Load all dashboard data from database
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        kpiDataResult,
        transactionsResult,
        notificationsResult,
        chartDataResult,
        metricsResult,
        growthResult
      ] = await Promise.all([
        DashboardService.getKPIData(),
        DashboardService.getRecentTransactions(),
        DashboardService.getNotifications(),
        DashboardService.getSalesChartData(),
        DashboardService.calculateBusinessMetrics(),
        DashboardService.getMonthlyGrowthData()
      ]);

      setKpiData(kpiDataResult);
      setRecentTransactions(transactionsResult);
      setNotifications(notificationsResult);
      setSalesChartData(chartDataResult);
      setBusinessMetrics(metricsResult);
      setMonthlyGrowth(growthResult);
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

  const handleQuickAction = (action) => {
    setIsQuickSiteOpen(false);
    
    switch (action) {
      case 'new-invoice':
        navigation.navigate('Invoice');
        break;
      case 'receive-payment':
        navigation.navigate('Payment');
        break;
      case 'add-customer':
        navigation.navigate('Parties', { action: 'add', type: 'customer' });
        break;
      case 'add-item':
        navigation.navigate('Inventory', { action: 'add' });
        break;
      case 'view-reports':
        navigation.navigate('Reports');
        break;
      default:
        console.log('Unknown quick action:', action);
    }
  };

  const toggleQuickSite = () => {
    const toValue = isQuickSiteOpen ? 0 : 1;
    Animated.spring(quickMenuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    setIsQuickSiteOpen(!isQuickSiteOpen);
  };

  // Render methods
  const renderKPICard = ({ item }) => (
    <KPICard
      title={item.title}
      value={item.value}
      trend={item.trend}
      icon={item.icon}
      color={item.color}
    />
  );

  const renderTransaction = ({ item }) => (
    <TransactionItem
      transaction={item}
      onPress={() => {
        if (item.type === 'invoice') {
          navigation.navigate('InvoiceTemplate', { invoiceId: item.id });
        }
      }}
    />
  );

  const renderNotification = ({ item }) => (
    <NotificationCard
      notification={item}
      onPress={() => {
        // Handle notification press based on type
        if (item.type === 'warning' && item.id.includes('overdue')) {
          navigation.navigate('Parties');
        } else if (item.type === 'info' && item.id.includes('lowstock')) {
          navigation.navigate('Inventory');
        }
      }}
    />
  );

  const renderSalesChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Weekly Sales</Text>
      <View style={styles.chartArea}>
        {salesChartData.map((data, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.salesBar, 
                  { height: Math.max((data.sales / 35000) * 80, 5) }
                ]} 
              />
              <View 
                style={[
                  styles.targetBar, 
                  { height: (data.target / 35000) * 80 }
                ]} 
              />
            </View>
            <Text style={styles.chartLabel}>{data.day}</Text>
            <Text style={styles.chartValue}>₹{(data.sales / 1000).toFixed(0)}K</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Sales</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Target</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <QuickActionButton
          title="New Invoice"
          icon="📄"
          color="#3B82F6"
          onPress={() => handleQuickAction('new-invoice')}
        />
        <QuickActionButton
          title="Receive Payment"
          icon="💰"
          color="#10B981"
          onPress={() => handleQuickAction('receive-payment')}
        />
        <QuickActionButton
          title="Add Customer"
          icon="👥"
          color="#8B5CF6"
          onPress={() => handleQuickAction('add-customer')}
        />
        <QuickActionButton
          title="Add Item"
          icon="📦"
          color="#F59E0B"
          onPress={() => handleQuickAction('add-item')}
        />
      </View>
    </View>
  );

  const kpiCards = [
    {
      title: "To Collect",
      value: `₹${(kpiData.toCollect || 0).toLocaleString('en-IN')}`,
      trend: kpiData.toCollectTrend || 0,
      icon: "💰",
      color: "#3B82F6"
    },
    {
      title: "To Pay",
      value: `₹${(kpiData.toPay || 0).toLocaleString('en-IN')}`,
      trend: kpiData.toPayTrend || 0,
      icon: "💳",
      color: "#EF4444"
    },
    {
      title: "Stock Value",
      value: `₹${(kpiData.stockValue || 0).toLocaleString('en-IN')}`,
      trend: kpiData.stockTrend || 0,
      icon: "📦",
      color: "#10B981"
    },
    {
      title: "Week Sales",
      value: `₹${(kpiData.weekSales || 0).toLocaleString('en-IN')}`,
      trend: kpiData.salesTrend || 0,
      icon: "📈",
      color: "#8B5CF6"
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.businessName}>Brojgar Business</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>

          {/* KPI Cards */}
          <FlatList
            data={kpiCards}
            renderItem={renderKPICard}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiContainer}
          />

          {/* Sales Chart */}
          {renderSalesChart()}

          {/* Business Metrics Summary */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Business Overview</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ₹{(businessMetrics.totalSales || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.metricLabel}>Monthly Sales</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {businessMetrics.totalCustomers || 0}
                </Text>
                <Text style={styles.metricLabel}>Customers</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {businessMetrics.totalItems || 0}
                </Text>
                <Text style={styles.metricLabel}>Products</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ₹{(businessMetrics.netRevenue || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.metricLabel}>Net Profit</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Notifications */}
          {notifications.length > 0 && (
            <View style={styles.notificationsContainer}>
              <Text style={styles.sectionTitle}>Important Alerts</Text>
              <FlatList
                data={notifications.slice(0, 3)} // Show only first 3
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredTransactions.slice(0, 5)} // Show only first 5
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating QuickSite Button */}
      <View style={styles.quickSiteContainer}>
        {isQuickSiteOpen && (
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
          >
            <TouchableOpacity
              style={[styles.quickSiteOption, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleQuickAction('new-invoice')}
            >
              <Text style={styles.quickSiteOptionText}>📄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSiteOption, { backgroundColor: '#10B981' }]}
              onPress={() => handleQuickAction('receive-payment')}
            >
              <Text style={styles.quickSiteOptionText}>💰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSiteOption, { backgroundColor: '#8B5CF6' }]}
              onPress={() => handleQuickAction('add-customer')}
            >
              <Text style={styles.quickSiteOptionText}>👥</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSiteOption, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleQuickAction('add-item')}
            >
              <Text style={styles.quickSiteOptionText}>📦</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSiteOption, { backgroundColor: '#EF4444' }]}
              onPress={() => handleQuickAction('view-reports')}
            >
              <Text style={styles.quickSiteOptionText}>📊</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <TouchableOpacity
          style={[
            styles.quickSiteButton,
            { transform: [{ rotate: isQuickSiteOpen ? '45deg' : '0deg' }] }
          ]}
          onPress={toggleQuickSite}
        >
          <Text style={styles.quickSiteButtonText}>+</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  kpiContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 15,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  salesBar: {
    width: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  targetBar: {
    width: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  chartValue: {
    fontSize: 10,
    color: '#64748B',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  metricsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  notificationsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  transactionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickSiteContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  quickSiteMenu: {
    marginBottom: 15,
    alignItems: 'center',
  },
  quickSiteOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickSiteOptionText: {
    fontSize: 20,
  },
  quickSiteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickSiteButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
