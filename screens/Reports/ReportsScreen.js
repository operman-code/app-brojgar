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
  FlatList,
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
      Alert.alert(
        "Export Report",
        "Choose export format:",
        [
          {
            text: "PDF",
            onPress: () => ReportsService.exportToPDF(reportType, reports[reportType])
          },
          {
            text: "Excel", 
            onPress: () => ReportsService.exportToExcel(reportType, reports[reportType])
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to export report");
    }
  };

  const reportTabs = [
    { id: 'overview', title: 'Overview', icon: '📊' },
    { id: 'sales', title: 'Sales', icon: '💰' },
    { id: 'purchases', title: 'Purchases', icon: '🛒' },
    { id: 'inventory', title: 'Inventory', icon: '📦' },
    { id: 'customers', title: 'Customers', icon: '👥' },
    { id: 'gst', title: 'GST', icon: '📋' }
  ];

  const renderTabBar = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabBar}
      contentContainerStyle={styles.tabBarContent}
    >
      {reportTabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            selectedReport === tab.id && styles.activeTab
          ]}
          onPress={() => setSelectedReport(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            selectedReport === tab.id && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOverviewReport = () => (
    <View style={styles.reportContainer}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Business Overview</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => exportReport('overview')}
        >
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>₹{reports.overview?.totalSales?.toLocaleString('en-IN') || '0'}</Text>
          <Text style={styles.kpiLabel}>Total Sales</Text>
          <Text style={[styles.kpiTrend, { color: '#10b981' }]}>+12.5%</Text>
        </View>
        
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>₹{reports.overview?.totalPurchases?.toLocaleString('en-IN') || '0'}</Text>
          <Text style={styles.kpiLabel}>Total Purchases</Text>
          <Text style={[styles.kpiTrend, { color: '#ef4444' }]}>+8.2%</Text>
        </View>
        
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>₹{reports.overview?.netProfit?.toLocaleString('en-IN') || '0'}</Text>
          <Text style={styles.kpiLabel}>Net Profit</Text>
          <Text style={[styles.kpiTrend, { color: '#10b981' }]}>+15.3%</Text>
        </View>
        
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{reports.overview?.totalCustomers || '0'}</Text>
          <Text style={styles.kpiLabel}>Total Customers</Text>
          <Text style={[styles.kpiTrend, { color: '#3b82f6' }]}>+5</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Outstanding Receivables:</Text>
          <Text style={styles.statValue}>₹{reports.overview?.outstandingReceivables?.toLocaleString('en-IN') || '0'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Outstanding Payables:</Text>
          <Text style={styles.statValue}>₹{reports.overview?.outstandingPayables?.toLocaleString('en-IN') || '0'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Inventory Value:</Text>
          <Text style={styles.statValue}>₹{reports.overview?.inventoryValue?.toLocaleString('en-IN') || '0'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Low Stock Items:</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{reports.overview?.lowStockCount || '0'} items</Text>
        </View>
      </View>
    </View>
  );

  const renderSalesReport = () => (
    <View style={styles.reportContainer}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Sales Report</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => exportReport('sales')}
        >
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Sales Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Sales Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹{reports.sales?.thisMonth?.toLocaleString('en-IN') || '0'}</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹{reports.sales?.lastMonth?.toLocaleString('en-IN') || '0'}</Text>
            <Text style={styles.summaryLabel}>Last Month</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reports.sales?.totalInvoices || '0'}</Text>
            <Text style={styles.summaryLabel}>Total Invoices</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹{reports.sales?.averageOrderValue?.toLocaleString('en-IN') || '0'}</Text>
            <Text style={styles.summaryLabel}>Avg. Order Value</Text>
          </View>
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        {reports.sales?.topProducts?.length > 0 ? (
          <FlatList
            data={reports.sales.topProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemRank}>#{index + 1}</Text>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSubtitle}>{item.quantity} units sold</Text>
                  </View>
                </View>
                <Text style={styles.listItemValue}>₹{item.revenue?.toLocaleString('en-IN')}</Text>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No sales data available</Text>
        )}
      </View>

      {/* Top Customers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Customers</Text>
        {reports.sales?.topCustomers?.length > 0 ? (
          <FlatList
            data={reports.sales.topCustomers}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemRank}>#{index + 1}</Text>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSubtitle}>{item.invoiceCount} invoices</Text>
                  </View>
                </View>
                <Text style={styles.listItemValue}>₹{item.totalPurchased?.toLocaleString('en-IN')}</Text>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No customer data available</Text>
        )}
      </View>
    </View>
  );

  const renderInventoryReport = () => (
    <View style={styles.reportContainer}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Inventory Report</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => exportReport('inventory')}
        >
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Inventory Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reports.inventory?.totalItems || '0'}</Text>
            <Text style={styles.summaryLabel}>Total Items</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹{reports.inventory?.totalValue?.toLocaleString('en-IN') || '0'}</Text>
            <Text style={styles.summaryLabel}>Total Value</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{reports.inventory?.lowStockItems || '0'}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{reports.inventory?.outOfStockItems || '0'}</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      {/* Low Stock Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Low Stock Items</Text>
        {reports.inventory?.lowStockList?.length > 0 ? (
          <FlatList
            data={reports.inventory.lowStockList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.inventoryItem}>
                <View style={styles.inventoryItemLeft}>
                  <Text style={styles.inventoryItemName}>{item.name}</Text>
                  <Text style={styles.inventoryItemDetails}>
                    Current: {item.currentStock} | Min: {item.minimumStock}
                  </Text>
                </View>
                <View style={styles.inventoryItemRight}>
                  <Text style={[styles.inventoryItemStock, { color: '#ef4444' }]}>
                    {item.currentStock} {item.unit}
                  </Text>
                  <Text style={styles.inventoryItemValue}>₹{item.value?.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>All items are adequately stocked</Text>
        )}
      </View>

      {/* Category Wise Stock */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Wise Stock</Text>
        {reports.inventory?.categoryWise?.length > 0 ? (
          <FlatList
            data={reports.inventory.categoryWise}
            keyExtractor={(item) => item.category}
            renderItem={({ item }) => (
              <View style={styles.categoryItem}>
                <View style={styles.categoryItemLeft}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryDetails}>{item.itemCount} items</Text>
                </View>
                <Text style={styles.categoryValue}>₹{item.totalValue?.toLocaleString('en-IN')}</Text>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No category data available</Text>
        )}
      </View>
    </View>
  );

  const renderGSTReport = () => (
    <View style={styles.reportContainer}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>GST Report</Text>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => exportReport('gst')}
        >
          <Text style={styles.exportButtonText}>📤 Export</Text>
        </TouchableOpacity>
      </View>

      {/* GST Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>GST Summary</Text>
        
        <View style={styles.gstSummaryCard}>
          <View style={styles.gstSummaryRow}>
            <Text style={styles.gstLabel}>Total Sales (Taxable):</Text>
            <Text style={styles.gstValue}>₹{reports.gst?.totalTaxableSales?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          
          <View style={styles.gstSummaryRow}>
            <Text style={styles.gstLabel}>Output GST Collected:</Text>
            <Text style={styles.gstValue}>₹{reports.gst?.outputGST?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          
          <View style={styles.gstSummaryRow}>
            <Text style={styles.gstLabel}>Input GST Paid:</Text>
            <Text style={styles.gstValue}>₹{reports.gst?.inputGST?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          
          <View style={[styles.gstSummaryRow, styles.gstTotalRow]}>
            <Text style={styles.gstTotalLabel}>Net GST Payable:</Text>
            <Text style={[styles.gstTotalValue, { 
              color: (reports.gst?.netGST || 0) > 0 ? '#ef4444' : '#10b981' 
            }]}>
              ₹{reports.gst?.netGST?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tax Rate Wise Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tax Rate Wise Breakdown</Text>
        {reports.gst?.taxRateWise?.length > 0 ? (
          <FlatList
            data={reports.gst.taxRateWise}
            keyExtractor={(item) => item.taxRate.toString()}
            renderItem={({ item }) => (
              <View style={styles.taxRateItem}>
                <View style={styles.taxRateLeft}>
                  <Text style={styles.taxRatePercent}>{item.taxRate}%</Text>
                  <Text style={styles.taxRateDetails}>
                    Taxable: ₹{item.taxableAmount?.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.taxRateRight}>
                  <Text style={styles.taxRateAmount}>₹{item.taxAmount?.toLocaleString('en-IN')}</Text>
                  <Text style={styles.taxRateLabel}>GST Amount</Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No GST data available</Text>
        )}
      </View>
    </View>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'sales':
        return renderSalesReport();
      case 'purchases':
        return renderSalesReport(); // Similar structure
      case 'inventory':
        return renderInventoryReport();
      case 'customers':
        return renderSalesReport(); // Customer focused version
      case 'gst':
        return renderGSTReport();
      default:
        return renderOverviewReport();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating Reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Generated At */}
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>
          Last updated: {new Date(generatedAt).toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Report Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderReportContent()}
      </ScrollView>
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
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  timestampContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timestampText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBarContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
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
  reportContainer: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  kpiTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summarySection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: (width - 64) / 2,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
    minWidth: 24,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    paddingVertical: 20,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inventoryItemLeft: {
    flex: 1,
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  inventoryItemDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  inventoryItemRight: {
    alignItems: 'flex-end',
  },
  inventoryItemStock: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inventoryItemValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryItemLeft: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  gstSummaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gstSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  gstLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  gstValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  gstTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  gstTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  gstTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taxRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  taxRateLeft: {
    flex: 1,
  },
  taxRatePercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 2,
  },
  taxRateDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  taxRateRight: {
    alignItems: 'flex-end',
  },
  taxRateAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  taxRateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ReportsScreen;