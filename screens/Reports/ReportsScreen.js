import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ReportsService from './services/ReportsService';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReportsData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getReportsData(selectedPeriod);
      setReportsData(data);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year', label: 'This Year' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'sales', label: 'Sales', icon: '💰' },
    { key: 'purchases', label: 'Purchases', icon: '🛒' },
    { key: 'profit', label: 'Profit & Loss', icon: '📈' },
  ];

  const kpiCards = reportsData ? [
    {
      title: 'Total Sales',
      value: reportsData.overview.totalSales,
      change: '+12.5%',
      positive: true,
      icon: '💰',
      color: '#10b981'
    },
    {
      title: 'Total Purchases',
      value: reportsData.overview.totalPurchases,
      change: '+8.2%',
      positive: true,
      icon: '🛒',
      color: '#3b82f6'
    },
    {
      title: 'Gross Profit',
      value: reportsData.overview.grossProfit,
      change: '+18.7%',
      positive: true,
      icon: '📈',
      color: '#8b5cf6'
    },
    {
      title: 'Net Profit',
      value: reportsData.overview.netProfit,
      change: '+22.1%',
      positive: true,
      icon: '🎯',
      color: '#06b6d4'
    },
  ] : [];

  const renderPeriodButton = (period) => (
    <TouchableOpacity
      key={period.key}
      style={[styles.periodButton, selectedPeriod === period.key && styles.activePeriodButton]}
      onPress={() => setSelectedPeriod(period.key)}
    >
      <Text style={[styles.periodButtonText, selectedPeriod === period.key && styles.activePeriodButtonText]}>
        {period.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
      onPress={() => setSelectedTab(tab.key)}
    >
      <Text style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderKPICard = (kpi, index) => (
    <View key={index} style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
          <Text style={styles.kpiIconText}>{kpi.icon}</Text>
        </View>
        <View style={[styles.changeIndicator, { backgroundColor: kpi.positive ? '#dcfce7' : '#fef2f2' }]}>
          <Text style={[styles.changeText, { color: kpi.positive ? '#166534' : '#dc2626' }]}>
            {kpi.change}
          </Text>
        </View>
      </View>
      <Text style={styles.kpiTitle}>{kpi.title}</Text>
      <Text style={styles.kpiValue}>₹{kpi.value.toLocaleString()}</Text>
    </View>
  );

  const renderTopItem = ({ item, index }) => (
    <View style={styles.topItemCard}>
      <View style={styles.topItemRank}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.topItemInfo}>
        <Text style={styles.topItemName}>{item.name}</Text>
        <Text style={styles.topItemDetails}>Qty: {item.quantity} • Profit: ₹{item.profit.toLocaleString()}</Text>
      </View>
      <View style={styles.topItemSales}>
        <Text style={styles.topItemAmount}>₹{item.sales.toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionType, { backgroundColor: item.type === 'sale' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.transactionTypeText, { color: item.type === 'sale' ? '#166534' : '#92400e' }]}>
            {item.type === 'sale' ? '📈' : '📉'}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionParty}>{item.party}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: item.amount > 0 ? '#10b981' : '#ef4444' }]}>
          {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? '#dcfce7' : '#fef3c7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'paid' ? '#166534' : '#92400e' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !reportsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>Business insights and analytics</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>📊 Export</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selection */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
            {periods.map(renderPeriodButton)}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {tabs.map(renderTab)}
            </View>
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {selectedTab === 'overview' && reportsData && (
            <>
              {/* KPI Cards */}
              <View style={styles.kpiContainer}>
                <View style={styles.kpiRow}>
                  {kpiCards.slice(0, 2).map(renderKPICard)}
                </View>
                <View style={styles.kpiRow}>
                  {kpiCards.slice(2, 4).map(renderKPICard)}
                </View>
              </View>

              {/* Performance Chart */}
              <View style={styles.chartCard}>
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.chartGradient}
                >
                  <Text style={styles.chartTitle}>Sales Performance</Text>
                  <Text style={styles.chartSubtitle}>
                    {selectedPeriod.replace('_', ' ').replace('this', 'This')} trend
                  </Text>
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartPlaceholderText}>📈 Sales trend visualization</Text>
                    <Text style={styles.chartValue}>
                      ₹{reportsData.overview.totalSales.toLocaleString()}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Top Selling Items */}
              {reportsData.topItems && reportsData.topItems.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Selling Items</Text>
                    <TouchableOpacity>
                      <Text style={styles.sectionLink}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={reportsData.topItems}
                    renderItem={renderTopItem}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Recent Transactions */}
              {reportsData.recentTransactions && reportsData.recentTransactions.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity>
                      <Text style={styles.sectionLink}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={reportsData.recentTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Empty State */}
              {(!reportsData.topItems || reportsData.topItems.length === 0) && 
               (!reportsData.recentTransactions || reportsData.recentTransactions.length === 0) && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyTitle}>No data available</Text>
                  <Text style={styles.emptyMessage}>
                    Start making sales to see your business reports
                  </Text>
                  <TouchableOpacity 
                    style={styles.emptyActionButton}
                    onPress={() => navigation.navigate('Invoice')}
                  >
                    <Text style={styles.emptyActionButtonText}>Create First Sale</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {selectedTab !== 'overview' && (
            <View style={styles.comingSoonCard}>
              <Text style={styles.comingSoonIcon}>🚧</Text>
              <Text style={styles.comingSoonTitle}>{tabs.find(t => t.key === selectedTab)?.label} Report</Text>
              <Text style={styles.comingSoonText}>Detailed {selectedTab} analytics coming soon</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
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
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  exportButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exportButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  periodContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
  },
  periodScroll: {
    paddingHorizontal: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activePeriodButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f8fafc',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  scrollContent: {
    flex: 1,
  },
  kpiContainer: {
    padding: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconText: {
    fontSize: 18,
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartGradient: {
    padding: 20,
    minHeight: 160,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  chartValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  topItemDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  topItemSales: {
    alignItems: 'flex-end',
  },
  topItemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionType: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTypeText: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionParty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default ReportsScreen;
