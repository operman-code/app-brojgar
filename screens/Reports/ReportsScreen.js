// screens/Reports/ReportsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";

// Import service
import ReportsService from "./services/ReportsService";

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const reportsData = await ReportsService.generateAllReports();
      setReports(reportsData);
      setGeneratedAt(reportsData.generatedAt);
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      Alert.alert("Error", "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const exportReport = async (reportType) => {
    try {
      const result = await ReportsService.exportReportData(reportType);
      if (result.success) {
        Alert.alert(
          "Export Successful",
          `Report exported as ${result.filename}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Export Failed", result.error);
      }
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      Alert.alert("Error", "Failed to export report");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverviewReport = () => {
    const overview = reports.overview || {};
    
    return (
      <ScrollView style={styles.reportContent}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatCurrency(overview.totalRevenue || 0)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricChange}>+{overview.revenueGrowth || 0}%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatCurrency(overview.totalExpenses || 0)}</Text>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text style={styles.metricChange}>+{overview.revenueGrowth || 0}%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatCurrency(overview.netProfit || 0)}</Text>
            <Text style={styles.metricLabel}>Net Profit</Text>
            <Text style={styles.metricChange}>+{overview.revenueGrowth || 0}%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{overview.profitMargin || 0}%</Text>
            <Text style={styles.metricLabel}>Profit Margin</Text>
            <Text style={styles.metricChange}>+{overview.revenueGrowth || 0}%</Text>
          </View>
        </View>

        {/* Business Overview */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{overview.totalCustomers || 0}</Text>
              <Text style={styles.overviewLabel}>Total Customers</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{overview.totalProducts || 0}</Text>
              <Text style={styles.overviewLabel}>Total Products</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{formatCurrency(overview.averageOrderValue || 0)}</Text>
              <Text style={styles.overviewLabel}>Avg Order Value</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{overview.activeInvoices || 0}</Text>
              <Text style={styles.overviewLabel}>Active Invoices</Text>
            </View>
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.topPerformersGrid}>
            <View style={styles.performerCard}>
              <Text style={styles.performerTitle}>Top Product</Text>
              <Text style={styles.performerValue}>{overview.topSellingProduct || 'N/A'}</Text>
            </View>
            <View style={styles.performerCard}>
              <Text style={styles.performerTitle}>Top Customer</Text>
              <Text style={styles.performerValue}>{overview.topCustomer || 'N/A'}</Text>
            </View>
            <View style={styles.performerCard}>
              <Text style={styles.performerTitle}>Fast Moving</Text>
              <Text style={styles.performerValue}>{overview.fastestMovingCategory || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderSalesReport = () => {
    const sales = reports.sales || {};
    
    return (
      <ScrollView style={styles.reportContent}>
        {/* Sales Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Sales Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(sales.totalSales || 0)}</Text>
              <Text style={styles.summaryLabel}>Total Sales</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sales.totalOrders || 0}</Text>
              <Text style={styles.summaryLabel}>Total Orders</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(sales.averageOrderValue || 0)}</Text>
              <Text style={styles.summaryLabel}>Avg Order Value</Text>
            </View>
          </View>
        </View>

        {/* Monthly Sales */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Monthly Sales Trend</Text>
          <View style={styles.chartContainer}>
            {(sales.monthlySales || []).map((monthData, index) => (
              <View key={index} style={styles.chartItem}>
                <Text style={styles.chartLabel}>{monthData.month}</Text>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartFill, 
                      { 
                        height: Math.max((monthData.sales / 100000) * 60, 5),
                        backgroundColor: '#3B82F6'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartValue}>₹{(monthData.sales / 1000).toFixed(0)}K</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Selling Items */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          {(sales.topSellingItems || []).slice(0, 5).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemDetail}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.listItemValue}>{formatCurrency(item.revenue || 0)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {(sales.paymentMethodBreakdown || []).map((method, index) => (
            <View key={index} style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>
                  {method.method.charAt(0).toUpperCase() + method.method.slice(1)}
                </Text>
                <Text style={styles.paymentMethodCount}>{method.count} transactions</Text>
              </View>
              <Text style={styles.paymentMethodValue}>{formatCurrency(method.total || 0)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderInventoryReport = () => {
    const inventory = reports.inventory || {};
    
    return (
      <ScrollView style={styles.reportContent}>
        {/* Inventory Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Inventory Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{inventory.totalItems || 0}</Text>
              <Text style={styles.summaryLabel}>Total Items</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(inventory.totalValue || 0)}</Text>
              <Text style={styles.summaryLabel}>Total Value</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{inventory.totalQuantity || 0}</Text>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
            </View>
          </View>
        </View>

        {/* Stock Alerts */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Stock Alerts</Text>
          
          {/* Low Stock Items */}
          <View style={styles.alertSection}>
            <Text style={styles.alertTitle}>⚠️ Low Stock Items</Text>
            {(inventory.lowStockItems || []).slice(0, 5).map((item, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertItemInfo}>
                  <Text style={styles.alertItemName}>{item.name}</Text>
                  <Text style={styles.alertItemDetail}>
                    Current: {item.currentStock} | Min: {item.minimumStock}
                  </Text>
                </View>
                <Text style={[styles.alertItemStatus, { color: '#F59E0B' }]}>Low Stock</Text>
              </View>
            ))}
          </View>

          {/* Out of Stock Items */}
          <View style={styles.alertSection}>
            <Text style={styles.alertTitle}>🚫 Out of Stock Items</Text>
            {(inventory.outOfStockItems || []).slice(0, 5).map((item, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertItemInfo}>
                  <Text style={styles.alertItemName}>{item.name}</Text>
                  <Text style={styles.alertItemDetail}>
                    Min Stock: {item.minimumStock}
                  </Text>
                </View>
                <Text style={[styles.alertItemStatus, { color: '#EF4444' }]}>Out of Stock</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {(inventory.categoryBreakdown || []).map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDetail}>{category.itemCount} items</Text>
              </View>
              <View style={styles.categoryValues}>
                <Text style={styles.categoryValue}>{formatCurrency(category.value || 0)}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Stock Movements */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Recent Stock Movements</Text>
          {(inventory.recentMovements || []).slice(0, 10).map((movement, index) => (
            <View key={index} style={styles.movementItem}>
              <View style={styles.movementInfo}>
                <Text style={styles.movementItemName}>{movement.itemName}</Text>
                <Text style={styles.movementDate}>{formatDate(movement.date)}</Text>
              </View>
              <View style={styles.movementDetails}>
                <Text style={[
                  styles.movementType,
                  { color: movement.type === 'in' ? '#10B981' : '#EF4444' }
                ]}>
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                </Text>
                <Text style={styles.movementNotes}>{movement.notes}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderPartiesReport = () => {
    const parties = reports.parties || {};
    
    return (
      <ScrollView style={styles.reportContent}>
        {/* Parties Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Parties Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{parties.totalCustomers || 0}</Text>
              <Text style={styles.summaryLabel}>Total Customers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{parties.totalSuppliers || 0}</Text>
              <Text style={styles.summaryLabel}>Total Suppliers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(parties.avgCustomerValue || 0)}</Text>
              <Text style={styles.summaryLabel}>Avg Customer Value</Text>
            </View>
          </View>
        </View>

        {/* Top Customers */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Top Customers by Revenue</Text>
          {(parties.topCustomers || []).slice(0, 5).map((customer, index) => (
            <View key={index} style={styles.customerItem}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerDetail}>
                  {customer.totalInvoices} invoices | {customer.phone}
                </Text>
              </View>
              <View style={styles.customerValues}>
                <Text style={styles.customerRevenue}>{formatCurrency(customer.totalRevenue || 0)}</Text>
                <Text style={styles.customerBalance}>
                  Balance: {formatCurrency(customer.balance || 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Outstanding Payments */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Outstanding Payments</Text>
          {(parties.outstandingCustomers || []).slice(0, 5).map((customer, index) => (
            <View key={index} style={styles.outstandingItem}>
              <View style={styles.outstandingInfo}>
                <Text style={styles.outstandingName}>{customer.name}</Text>
                <Text style={styles.outstandingDetail}>{customer.phone}</Text>
              </View>
              <Text style={[styles.outstandingAmount, { color: '#EF4444' }]}>
                {formatCurrency(customer.outstandingAmount || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Suppliers */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Suppliers</Text>
          {(parties.suppliers || []).slice(0, 5).map((supplier, index) => (
            <View key={index} style={styles.supplierItem}>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierDetail}>
                  {supplier.totalExpenses} transactions | {supplier.phone}
                </Text>
              </View>
              <Text style={styles.supplierBalance}>
                Balance: {formatCurrency(supplier.balance || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Patterns */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Payment Patterns</Text>
          <View style={styles.paymentPatternsGrid}>
            <View style={styles.patternCard}>
              <Text style={styles.patternValue}>{parties.paymentPatterns?.onTime || 0}</Text>
              <Text style={styles.patternLabel}>On Time</Text>
              <Text style={[styles.patternStatus, { color: '#10B981' }]}>✓</Text>
            </View>
            <View style={styles.patternCard}>
              <Text style={styles.patternValue}>{parties.paymentPatterns?.late || 0}</Text>
              <Text style={styles.patternLabel}>Late</Text>
              <Text style={[styles.patternStatus, { color: '#F59E0B' }]}>⚠</Text>
            </View>
            <View style={styles.patternCard}>
              <Text style={styles.patternValue}>{parties.paymentPatterns?.overdue || 0}</Text>
              <Text style={styles.patternLabel}>Overdue</Text>
              <Text style={[styles.patternStatus, { color: '#EF4444' }]}>✕</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderFinancialReport = () => {
    const financial = reports.financial || {};
    
    return (
      <ScrollView style={styles.reportContent}>
        {/* Financial Summary */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(financial.currentMonthRevenue || 0)}</Text>
              <Text style={styles.summaryLabel}>Monthly Revenue</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(financial.currentMonthExpenses || 0)}</Text>
              <Text style={styles.summaryLabel}>Monthly Expenses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(financial.currentMonthProfit || 0)}</Text>
              <Text style={styles.summaryLabel}>Monthly Profit</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{financial.profitMargin || 0}%</Text>
              <Text style={styles.summaryLabel}>Profit Margin</Text>
            </View>
          </View>
        </View>

        {/* Year to Date */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Year to Date</Text>
          <View style={styles.ytdGrid}>
            <View style={styles.ytdItem}>
              <Text style={styles.ytdValue}>{formatCurrency(financial.yearToDateRevenue || 0)}</Text>
              <Text style={styles.ytdLabel}>YTD Revenue</Text>
            </View>
            <View style={styles.ytdItem}>
              <Text style={styles.ytdValue}>{formatCurrency(financial.yearToDateExpenses || 0)}</Text>
              <Text style={styles.ytdLabel}>YTD Expenses</Text>
            </View>
          </View>
        </View>

        {/* Cash Flow */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Cash Flow (30 Days)</Text>
          <View style={styles.cashFlowGrid}>
            <View style={styles.cashFlowItem}>
              <Text style={[styles.cashFlowValue, { color: '#10B981' }]}>
                {formatCurrency(financial.cashFlow?.inflow || 0)}
              </Text>
              <Text style={styles.cashFlowLabel}>Cash Inflow</Text>
            </View>
            <View style={styles.cashFlowItem}>
              <Text style={[styles.cashFlowValue, { color: '#EF4444' }]}>
                {formatCurrency(financial.cashFlow?.outflow || 0)}
              </Text>
              <Text style={styles.cashFlowLabel}>Cash Outflow</Text>
            </View>
            <View style={styles.cashFlowItem}>
              <Text style={[
                styles.cashFlowValue, 
                { color: (financial.cashFlow?.netCashFlow || 0) >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {formatCurrency(financial.cashFlow?.netCashFlow || 0)}
              </Text>
              <Text style={styles.cashFlowLabel}>Net Cash Flow</Text>
            </View>
          </View>
        </View>

        {/* Monthly Revenue Trend */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Revenue Trend (12 Months)</Text>
          <View style={styles.chartContainer}>
            {(financial.monthlyRevenue || []).map((monthData, index) => (
              <View key={index} style={styles.chartItem}>
                <Text style={styles.chartLabel}>{monthData.month}</Text>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartFill, 
                      { 
                        height: Math.max((monthData.revenue / 100000) * 60, 5),
                        backgroundColor: '#10B981'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartValue}>₹{(monthData.revenue / 1000).toFixed(0)}K</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Expenses Trend */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Expenses Trend (12 Months)</Text>
          <View style={styles.chartContainer}>
            {(financial.monthlyExpenses || []).map((monthData, index) => (
              <View key={index} style={styles.chartItem}>
                <Text style={styles.chartLabel}>{monthData.month}</Text>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartFill, 
                      { 
                        height: Math.max((monthData.expenses / 100000) * 60, 5),
                        backgroundColor: '#EF4444'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartValue}>₹{(monthData.expenses / 1000).toFixed(0)}K</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (selectedReport) {
      case "overview":
        return renderOverviewReport();
      case "sales":
        return renderSalesReport();
      case "inventory":
        return renderInventoryReport();
      case "parties":
        return renderPartiesReport();
      case "financial":
        return renderFinancialReport();
      default:
        return renderOverviewReport();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => exportReport(selectedReport)}
        >
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Generation Info */}
      <View style={styles.generationInfo}>
        <Text style={styles.generationText}>
          Last updated: {formatDate(generatedAt)}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Report Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          { key: "sales", label: "Sales", icon: "💰" },
          { key: "inventory", label: "Inventory", icon: "📦" },
          { key: "parties", label: "Parties", icon: "👥" },
          { key: "financial", label: "Financial", icon: "💳" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedReport === tab.key && styles.activeTab,
            ]}
            onPress={() => setSelectedReport(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabText,
                selectedReport === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Report Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  generationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
  },
  generationText: {
    fontSize: 12,
    color: '#64748B',
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  reportContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reportSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    marginBottom: 15,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  metricChange: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '500',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  topPerformersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performerCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  performerTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  performerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginVertical: 15,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    height: 80,
    width: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginVertical: 5,
  },
  chartFill: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 5,
  },
  chartValue: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  listItemDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentMethodCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  paymentMethodValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  alertSection: {
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertItemInfo: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  alertItemDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  alertItemStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  movementInfo: {
    flex: 1,
  },
  movementItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  movementDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  movementDetails: {
    alignItems: 'flex-end',
  },
  movementType: {
    fontSize: 14,
    fontWeight: '600',
  },
  movementNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
    marginTop: 2,
  },
  customerValues: {
    alignItems: 'flex-end',
  },
  customerRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  customerBalance: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  outstandingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  outstandingInfo: {
    flex: 1,
  },
  outstandingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  outstandingDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  outstandingAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  supplierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  supplierDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  supplierBalance: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentPatternsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patternCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  patternValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  patternLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  patternStatus: {
    fontSize: 16,
    marginTop: 4,
  },
  ytdGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ytdItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  ytdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  ytdLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  cashFlowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cashFlowItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cashFlowValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cashFlowLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ReportsScreen;
