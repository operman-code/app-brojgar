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
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";

// Import services
import ReportsService from "./services/ReportsService";
import DashboardService from "../Dashboard/services/DashboardService";
import PartiesService from "../Parties/services/PartiesService";
import InventoryService from "../Inventory/services/InventoryService";

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview"); // overview, sales, inventory, parties, financial
  const [businessMetrics, setBusinessMetrics] = useState({});
  const [salesData, setSalesData] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [partiesData, setPartiesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      // Load data from all services
      const metrics = DashboardService.calculateBusinessMetrics();
      const sales = DashboardService.getSalesChartData();
      const inventory = InventoryService.getInventorySummary();
      const parties = PartiesService.getPartiesSummary();
      const reports = await ReportsService.generateAllReports();

      setBusinessMetrics({ ...metrics, ...reports.overview });
      setSalesData({ chartData: sales, ...reports.sales });
      setInventoryData({ ...inventory, ...reports.inventory });
      setPartiesData({ ...parties, ...reports.parties });
    } catch (error) {
      Alert.alert("Error", "Failed to load reports data");
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const handleExportReport = (reportType) => {
    Alert.alert(
      "Export Report",
      `Export ${reportType} report as:`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "PDF", onPress: () => exportReport(reportType, "pdf") },
        { text: "Excel", onPress: () => exportReport(reportType, "excel") },
      ]
    );
  };

  const exportReport = (reportType, format) => {
    Alert.alert("Success", `${reportType} report exported as ${format.toUpperCase()}`);
  };

  const renderMetricCard = (title, value, subtitle, color = "#3b82f6", icon = "📊") => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderChartPlaceholder = (title, height = 200) => (
    <View style={[styles.chartContainer, { height }]}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartIcon}>📈</Text>
        <Text style={styles.chartText}>Chart visualization would appear here</Text>
        <Text style={styles.chartSubtext}>In a production app, integrate with charting library</Text>
      </View>
    </View>
  );

  const renderTabButton = (tabId, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabId && styles.activeTabButton]}
      onPress={() => setSelectedTab(tabId)}
    >
      <Text style={[styles.tabIcon, selectedTab === tabId && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabTitle, selectedTab === tabId && styles.activeTabTitle]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Business Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 Business Overview</Text>
          <TouchableOpacity onPress={() => handleExportReport("Business Overview")}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Revenue",
            `₹${businessMetrics.totalSales?.toLocaleString("en-IN") || "0"}`,
            "This month",
            "#10b981",
            "💰"
          )}
          {renderMetricCard(
            "Net Profit",
            `₹${businessMetrics.netRevenue?.toLocaleString("en-IN") || "0"}`,
            "After expenses",
            "#059669",
            "📊"
          )}
          {renderMetricCard(
            "Active Customers",
            salesData.totalCustomers || "0",
            "This month",
            "#3b82f6",
            "👥"
          )}
          {renderMetricCard(
            "Inventory Value",
            inventoryData.totalStockValue || "₹0",
            "Current stock",
            "#8b5cf6",
            "📦"
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{businessMetrics.salesCount || 0}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inventoryData.totalItems || 0}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{partiesData.totalParties || 0}</Text>
            <Text style={styles.statLabel}>Total Parties</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>{inventoryData.outOfStockCount || 0}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      {/* Performance Chart */}
      {renderChartPlaceholder("Monthly Performance Trend", 220)}
      
      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Recent Activity Summary</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Sales Performance</Text>
              <Text style={styles.activityDesc}>
                {businessMetrics.salesCount || 0} transactions completed this month
              </Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📦</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Inventory Status</Text>
              <Text style={styles.activityDesc}>
                {inventoryData.lowStockCount || 0} items need reordering
              </Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>💰</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Outstanding Payments</Text>
              <Text style={styles.activityDesc}>
                {partiesData.totalReceivables || "₹0"} to be collected
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSalesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Sales Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💰 Sales Analytics</Text>
          <TouchableOpacity onPress={() => handleExportReport("Sales Report")}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Sales",
            `₹${businessMetrics.totalSales?.toLocaleString("en-IN") || "0"}`,
            "This month",
            "#10b981",
            "💰"
          )}
          {renderMetricCard(
            "Average Sale",
            `₹${businessMetrics.averageSaleValue?.toLocaleString("en-IN") || "0"}`,
            "Per transaction",
            "#3b82f6",
            "📊"
          )}
          {renderMetricCard(
            "Top Customer",
            partiesData.topCustomer?.customer || "N/A",
            `₹${partiesData.topCustomer?.total?.toLocaleString("en-IN") || "0"}`,
            "#8b5cf6",
            "👑"
          )}
          {renderMetricCard(
            "Sales Growth",
            "+18.2%",
            "vs last month",
            "#059669",
            "📈"
          )}
        </View>
      </View>

      {/* Sales Chart */}
      {renderChartPlaceholder("Weekly Sales Trend", 250)}

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Performing Products</Text>
        <View style={styles.topItemsContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={styles.topItem}>
              <View style={styles.topItemRank}>
                <Text style={styles.rankText}>{index}</Text>
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>Product {index}</Text>
                <Text style={styles.topItemSales}>₹{(50000 - index * 8000).toLocaleString("en-IN")} sales</Text>
              </View>
              <Text style={styles.topItemTrend}>
                {index <= 3 ? "📈" : "📉"}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Sales by Category */}
      {renderChartPlaceholder("Sales by Category", 200)}
    </ScrollView>
  );

  const renderInventoryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Inventory Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📦 Inventory Analytics</Text>
          <TouchableOpacity onPress={() => handleExportReport("Inventory Report")}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Items",
            inventoryData.totalItems?.toString() || "0",
            "In inventory",
            "#3b82f6",
            "📦"
          )}
          {renderMetricCard(
            "Stock Value",
            inventoryData.totalStockValue || "₹0",
            "Current value",
            "#10b981",
            "💰"
          )}
          {renderMetricCard(
            "Low Stock",
            inventoryData.lowStockCount?.toString() || "0",
            "Need reorder",
            "#f59e0b",
            "⚠️"
          )}
          {renderMetricCard(
            "Out of Stock",
            inventoryData.outOfStockCount?.toString() || "0",
            "Critical items",
            "#ef4444",
            "🚨"
          )}
        </View>
      </View>

      {/* Stock Status Chart */}
      {renderChartPlaceholder("Stock Status Distribution", 200)}

      {/* Reorder Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Reorder Alerts</Text>
        <View style={styles.alertsContainer}>
          <View style={styles.alertItem}>
            <Text style={styles.alertIcon}>🚨</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Critical Stock Alert</Text>
              <Text style={styles.alertDesc}>
                {inventoryData.outOfStockCount || 0} items are completely out of stock
              </Text>
            </View>
            <Text style={styles.alertTime}>Now</Text>
          </View>
          <View style={styles.alertItem}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Low Stock Warning</Text>
              <Text style={styles.alertDesc}>
                {inventoryData.lowStockCount || 0} items below minimum threshold
              </Text>
            </View>
            <Text style={styles.alertTime}>2h ago</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {renderChartPlaceholder("Inventory by Category", 220)}
    </ScrollView>
  );

  const renderPartiesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Parties Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👥 Parties Analytics</Text>
          <TouchableOpacity onPress={() => handleExportReport("Parties Report")}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Customers",
            partiesData.totalCustomers?.toString() || "0",
            "Active customers",
            "#3b82f6",
            "👤"
          )}
          {renderMetricCard(
            "Total Suppliers",
            partiesData.totalSuppliers?.toString() || "0",
            "Active suppliers",
            "#8b5cf6",
            "🏢"
          )}
          {renderMetricCard(
            "Receivables",
            partiesData.totalReceivables || "₹0",
            "To collect",
            "#10b981",
            "💰"
          )}
          {renderMetricCard(
            "Payables",
            partiesData.totalPayables || "₹0",
            "To pay",
            "#ef4444",
            "💳"
          )}
        </View>
      </View>

      {/* Receivables vs Payables */}
      {renderChartPlaceholder("Receivables vs Payables Trend", 200)}

      {/* Top Customers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Customers by Value</Text>
        <View style={styles.topItemsContainer}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={styles.topItem}>
              <View style={styles.topItemRank}>
                <Text style={styles.rankText}>{index}</Text>
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>Customer {index}</Text>
                <Text style={styles.topItemSales}>₹{(75000 - index * 12000).toLocaleString("en-IN")} outstanding</Text>
              </View>
              <Text style={styles.topItemTrend}>💰</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Payment Status */}
      {renderChartPlaceholder("Payment Status Overview", 200)}
    </ScrollView>
  );

  const renderFinancialTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Financial Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💹 Financial Analytics</Text>
          <TouchableOpacity onPress={() => handleExportReport("Financial Report")}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Revenue",
            `₹${businessMetrics.totalSales?.toLocaleString("en-IN") || "0"}`,
            "This month",
            "#10b981",
            "💰"
          )}
          {renderMetricCard(
            "Expenses",
            `₹${businessMetrics.totalPurchases?.toLocaleString("en-IN") || "0"}`,
            "This month",
            "#ef4444",
            "💳"
          )}
          {renderMetricCard(
            "Net Profit",
            `₹${businessMetrics.netRevenue?.toLocaleString("en-IN") || "0"}`,
            "Revenue - Expenses",
            "#059669",
            "📊"
          )}
          {renderMetricCard(
            "Profit Margin",
            `${((businessMetrics.netRevenue / businessMetrics.totalSales * 100) || 0).toFixed(1)}%`,
            "Profit percentage",
            "#8b5cf6",
            "📈"
          )}
        </View>
      </View>

      {/* Profit & Loss Chart */}
      {renderChartPlaceholder("Profit & Loss Trend", 250)}

      {/* Financial Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💊 Financial Health Indicators</Text>
        <View style={styles.healthContainer}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Cash Flow</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: "85%", backgroundColor: "#10b981" }]} />
            </View>
            <Text style={styles.healthValue}>Excellent</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Receivables Ratio</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: "65%", backgroundColor: "#f59e0b" }]} />
            </View>
            <Text style={styles.healthValue}>Good</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Inventory Turnover</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: "75%", backgroundColor: "#3b82f6" }]} />
            </View>
            <Text style={styles.healthValue}>Very Good</Text>
          </View>
        </View>
      </View>

      {/* Cash Flow Chart */}
      {renderChartPlaceholder("Cash Flow Analysis", 220)}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>📊</Text>
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
        <Text style={styles.headerSubtitle}>Business insights and performance metrics</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {renderTabButton("overview", "Overview", "📈")}
        {renderTabButton("sales", "Sales", "💰")}
        {renderTabButton("inventory", "Inventory", "📦")}
        {renderTabButton("parties", "Parties", "👥")}
        {renderTabButton("financial", "Financial", "💹")}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {selectedTab === "overview" && renderOverviewTab()}
        {selectedTab === "sales" && renderSalesTab()}
        {selectedTab === "inventory" && renderInventoryTab()}
        {selectedTab === "parties" && renderPartiesTab()}
        {selectedTab === "financial" && renderFinancialTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 80,
  },
  activeTabButton: {
    backgroundColor: "#eff6ff",
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 22,
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  exportText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  chartIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  chartText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  chartSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },
  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  activityDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  topItemsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  topItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  topItemRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  topItemSales: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  topItemTrend: {
    fontSize: 16,
  },
  alertsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  alertDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  alertTime: {
    fontSize: 11,
    color: "#9ca3af",
  },
  healthContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  healthItem: {
    marginBottom: 16,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  healthBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 6,
  },
  healthFill: {
    height: "100%",
    borderRadius: 4,
  },
  healthValue: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
});

export default ReportsScreen;