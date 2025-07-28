// screens/Reports/ReportsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';

import ReportsService from './services/ReportsService';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reportsData, setReportsData] = useState({
    overview: {},
    salesData: [],
    customerData: [],
    inventoryData: [],
    profitLossData: {},
    taxData: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReportsData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getReportsData();
      setReportsData(data);
    } catch (error) {
      console.error('❌ Error loading reports data:', error);
      Alert.alert('Error', 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') {
      number = parseFloat(number) || 0;
    }
    return number.toLocaleString('en-IN');
  };

  const formatPercentage = (percentage) => {
    if (typeof percentage !== 'number') {
      percentage = parseFloat(percentage) || 0;
    }
    return `${percentage.toFixed(1)}%`;
  };

  const handleExportReport = async () => {
    try {
      Alert.alert(
        'Export Report',
        'Choose export format:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'CSV',
            onPress: () => exportToFormat('csv')
          },
          {
            text: 'PDF',
            onPress: () => exportToFormat('pdf')
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const exportToFormat = async (format) => {
    try {
      const result = await ReportsService.exportReport(selectedTab, reportsData[selectedTab], format);
      if (result.success) {
        Alert.alert('Success', `Report exported as ${format.toUpperCase()}`);
      } else {
        Alert.alert('Error', 'Failed to export report');
      }
    } catch (error) {
      console.error('❌ Error exporting to format:', error);
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatCurrency(reportsData.overview.totalSales || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Total Sales</Text>
          <Text style={styles.kpiIcon}>💰</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatCurrency(reportsData.overview.totalExpenses || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Total Expenses</Text>
          <Text style={styles.kpiIcon}>💳</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatCurrency(reportsData.overview.netProfit || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Net Profit</Text>
          <Text style={styles.kpiIcon}>📈</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatNumber(reportsData.overview.totalCustomers || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Customers</Text>
          <Text style={styles.kpiIcon}>👥</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatNumber(reportsData.overview.totalInvoices || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Invoices</Text>
          <Text style={styles.kpiIcon}>🧾</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>
            {formatNumber(reportsData.overview.totalItems || 0)}
          </Text>
          <Text style={styles.kpiLabel}>Items</Text>
          <Text style={styles.kpiIcon}>📦</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Business Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending Payments:</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(reportsData.overview.pendingPayments || 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Low Stock Items:</Text>
          <Text style={styles.summaryValue}>
            {formatNumber(reportsData.overview.lowStockItems || 0)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSales = () => (
    <View style={styles.salesContainer}>
      <Text style={styles.sectionTitle}>Sales Performance</Text>
      
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>📊 Sales Chart</Text>
        <Text style={styles.chartSubtext}>
          Total Sales: {formatCurrency(reportsData.overview.totalSales || 0)}
        </Text>
      </View>

      <View style={styles.salesList}>
        <Text style={styles.listTitle}>Recent Sales</Text>
        {reportsData.salesData && reportsData.salesData.length > 0 ? (
          reportsData.salesData.slice(0, 5).map((sale, index) => (
            <View key={index} style={styles.salesItem}>
              <View style={styles.salesInfo}>
                <Text style={styles.salesInvoice}>{sale.invoice_number}</Text>
                <Text style={styles.salesCustomer}>{sale.customer_name}</Text>
              </View>
              <View style={styles.salesAmount}>
                <Text style={styles.salesTotal}>
                  {formatCurrency(sale.total || 0)}
                </Text>
                <Text style={styles.salesDate}>
                  {new Date(sale.date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No sales data available</Text>
        )}
      </View>
    </View>
  );

  const renderCustomers = () => (
    <View style={styles.customersContainer}>
      <Text style={styles.sectionTitle}>Customer Analysis</Text>
      
      <View style={styles.customersList}>
        {reportsData.customerData && reportsData.customerData.length > 0 ? (
          reportsData.customerData.slice(0, 10).map((customer, index) => (
            <View key={index} style={styles.customerItem}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerDetail}>
                  {formatNumber(customer.total_invoices || 0)} invoices
                </Text>
              </View>
              <View style={styles.customerAmount}>
                <Text style={styles.customerTotal}>
                  {formatCurrency(customer.total_purchases || 0)}
                </Text>
                <Text style={styles.customerOutstanding}>
                  Outstanding: {formatCurrency(customer.outstanding_amount || 0)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No customer data available</Text>
        )}
      </View>
    </View>
  );

  const renderInventory = () => (
    <View style={styles.inventoryContainer}>
      <Text style={styles.sectionTitle}>Inventory Report</Text>
      
      <View style={styles.inventoryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatNumber(reportsData.overview.totalItems || 0)}
          </Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatNumber(reportsData.overview.lowStockItems || 0)}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      <View style={styles.inventoryList}>
        {reportsData.inventoryData && reportsData.inventoryData.length > 0 ? (
          reportsData.inventoryData.slice(0, 10).map((item, index) => (
            <View key={index} style={styles.inventoryItem}>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryName}>{item.item_name}</Text>
                <Text style={styles.inventoryCode}>{item.item_code}</Text>
              </View>
              <View style={styles.inventoryData}>
                <Text style={styles.inventoryStock}>
                  Stock: {formatNumber(item.stock_quantity || 0)}
                </Text>
                <Text style={styles.inventoryValue}>
                  Value: {formatCurrency(item.stock_value || 0)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No inventory data available</Text>
        )}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'sales':
        return renderSales();
      case 'customers':
        return renderCustomers();
      case 'inventory':
        return renderInventory();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportReport}
          >
            <Text style={styles.exportButtonText}>📤 Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'this_week', label: 'This Week' },
              { key: 'this_month', label: 'This Month' },
              { key: 'last_month', label: 'Last Month' },
              { key: 'this_year', label: 'This Year' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.selectedPeriodButtonText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'sales', label: 'Sales', icon: '💰' },
            { key: 'customers', label: 'Customers', icon: '👥' },
            { key: 'inventory', label: 'Inventory', icon: '📦' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
          <View style={{ height: 50 }} />
        </ScrollView>
      </Animated.View>
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
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  periodContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  selectedPeriodButton: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  kpiIcon: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  salesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartText: {
    fontSize: 24,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  salesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  salesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  salesInfo: {
    flex: 1,
  },
  salesInvoice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  salesCustomer: {
    fontSize: 12,
    color: '#64748B',
  },
  salesAmount: {
    alignItems: 'flex-end',
  },
  salesTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  salesDate: {
    fontSize: 12,
    color: '#64748B',
  },
  customersContainer: {
    padding: 16,
  },
  customersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  customerDetail: {
    fontSize: 12,
    color: '#64748B',
  },
  customerAmount: {
    alignItems: 'flex-end',
  },
  customerTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  customerOutstanding: {
    fontSize: 12,
    color: '#EF4444',
  },
  inventoryContainer: {
    padding: 16,
  },
  inventoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  inventoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  inventoryCode: {
    fontSize: 12,
    color: '#64748B',
  },
  inventoryData: {
    alignItems: 'flex-end',
  },
  inventoryStock: {
    fontSize: 12,
    color: '#64748B',
  },
  inventoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 16,
    paddingVertical: 32,
  },
});

export default ReportsScreen;
