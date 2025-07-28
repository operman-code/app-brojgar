// screens/Reports/ReportsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
} from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from "react-native-chart-kit";

// Import service
import ReportsService from "./services/ReportsService";

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadReportsData();
    startAnimation();
  }, [selectedPeriod]);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getReportsData(selectedPeriod);
      setReportsData(data);
      generateChartData(data);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    if (!data) return;

    // Sales Chart Data
    const salesChart = {
      labels: data.salesData?.chartLabels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        data: data.salesData?.chartValues || [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2
      }]
    };

    // Revenue vs Expenses Bar Chart
    const revenueExpensesChart = {
      labels: ["Revenue", "Expenses", "Profit"],
      datasets: [{
        data: [
          data.overview?.totalRevenue || 0,
          data.overview?.totalExpenses || 0,
          data.overview?.netProfit || 0
        ]
      }]
    };

    // Top Categories Pie Chart
    const categoriesChart = data.inventoryData?.topCategories?.map((cat, index) => ({
      name: cat.name,
      value: cat.value,
      color: getColorForIndex(index),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    })) || [];

    setChartData({
      sales: salesChart,
      revenueExpenses: revenueExpensesChart,
      categories: categoriesChart
    });
  };

  const getColorForIndex = (index) => {
    const colors = [
      "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
      "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
    ];
    return colors[index % colors.length];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#3b82f6"
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            ₹{reportsData?.overview?.totalRevenue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            ₹{reportsData?.overview?.totalExpenses?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.kpiLabel}>Total Expenses</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: '#10b981' }]}>
            ₹{reportsData?.overview?.netProfit?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.kpiLabel}>Net Profit</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {reportsData?.overview?.totalTransactions || '0'}
          </Text>
          <Text style={styles.kpiLabel}>Transactions</Text>
        </View>
      </View>

      {/* Revenue vs Expenses Chart */}
      {chartData?.revenueExpenses && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue vs Expenses</Text>
          <BarChart
            data={chartData.revenueExpenses}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        </View>
      )}
    </View>
  );

  const renderSalesTab = () => (
    <View style={styles.tabContent}>
      {/* Sales Trend Chart */}
      {chartData?.sales && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          <LineChart
            data={chartData.sales}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Sales Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ₹{reportsData?.salesData?.totalSales?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {reportsData?.salesData?.totalOrders || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Total Orders</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ₹{reportsData?.salesData?.averageOrderValue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Avg Order Value</Text>
        </View>
      </View>
    </View>
  );

  const renderInventoryTab = () => (
    <View style={styles.tabContent}>
      {/* Top Categories Pie Chart */}
      {chartData?.categories && chartData.categories.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top Categories</Text>
          <PieChart
            data={chartData.categories}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 50]}
            absolute
            style={styles.chart}
          />
        </View>
      )}

      {/* Inventory Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ₹{reportsData?.inventoryData?.totalValue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Inventory Value</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {reportsData?.inventoryData?.totalItems || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            {reportsData?.inventoryData?.lowStockItems || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
      </View>
    </View>
  );

  const renderCustomersTab = () => (
    <View style={styles.tabContent}>
      {/* Customer Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {reportsData?.customerData?.totalCustomers || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Total Customers</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {reportsData?.customerData?.newCustomers || '0'}
          </Text>
          <Text style={styles.summaryLabel}>New Customers</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            ₹{reportsData?.customerData?.averageCustomerValue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.summaryLabel}>Avg Customer Value</Text>
        </View>
      </View>

      {/* Top Customers List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Top Customers</Text>
        {reportsData?.customerData?.topCustomers?.map((customer, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerInfo}>{customer.totalOrders} orders</Text>
            </View>
            <Text style={styles.customerValue}>
              ₹{customer.totalValue?.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading && !reportsData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reports</Text>
        </View>
        <TouchableOpacity 
          style={styles.periodButton}
          onPress={() => {
            // Add period selector modal here
          }}
        >
          <Text style={styles.periodText}>This Month</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {['overview', 'sales', 'inventory', 'customers'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab && styles.activeTabButtonText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'sales' && renderSalesTab()}
        {selectedTab === 'inventory' && renderInventoryTab()}
        {selectedTab === 'customers' && renderCustomersTab()}
      </Animated.ScrollView>
    </SafeAreaView>
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
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  periodButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3b82f6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: '2%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  summaryCard: {
    width: '32%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: '2%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemLeft: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  customerInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  customerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default ReportsScreen;
