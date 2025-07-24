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
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DashboardService from './services/DashboardService';

const DashboardScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kpiCards = dashboardData ? [
    {
      title: 'Today\'s Sales',
      value: dashboardData.kpis.todaySales,
      count: dashboardData.kpis.todayCount,
      change: '+12.5%',
      positive: true,
      icon: '💰',
      color: '#10b981'
    },
    {
      title: 'Month Sales',
      value: dashboardData.kpis.monthSales,
      count: dashboardData.kpis.monthCount,
      change: `+${dashboardData.insights.salesGrowth}%`,
      positive: dashboardData.insights.salesGrowth >= 0,
      icon: '📈',
      color: '#3b82f6'
    },
    {
      title: 'Customers',
      value: dashboardData.kpis.totalCustomers,
      change: '+5',
      positive: true,
      icon: '👥',
      color: '#8b5cf6'
    },
    {
      title: 'Low Stock',
      value: dashboardData.kpis.lowStockCount,
      change: dashboardData.kpis.lowStockCount > 0 ? 'Action needed' : 'All good',
      positive: dashboardData.kpis.lowStockCount === 0,
      icon: '📦',
      color: dashboardData.kpis.lowStockCount > 0 ? '#ef4444' : '#10b981'
    },
  ] : [];

  const quickActions = [
    { id: 1, title: 'New Sale', icon: '💰', color: '#10b981', action: () => navigation.navigate('Invoice') },
    { id: 2, title: 'Add Party', icon: '👤', color: '#3b82f6', action: () => navigation.navigate('Parties') },
    { id: 3, title: 'Add Item', icon: '📦', color: '#8b5cf6', action: () => navigation.navigate('Inventory') },
    { id: 4, title: 'View Reports', icon: '📊', color: '#f59e0b', action: () => navigation.navigate('Reports') },
  ];

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
      <Text style={styles.kpiValue}>
        {typeof kpi.value === 'number' && kpi.title.toLowerCase().includes('sales') 
          ? formatCurrency(kpi.value)
          : kpi.value}
      </Text>
      {kpi.count && (
        <Text style={styles.kpiCount}>{kpi.count} transactions</Text>
      )}
    </View>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.quickActionCard, { borderColor: action.color + '30' }]}
      onPress={action.action}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Text style={styles.quickActionIconText}>{action.icon}</Text>
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderTransaction = (transaction, index) => (
    <View key={index} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: '#3b82f6' + '20' }]}>
          <Text style={styles.transactionIconText}>💰</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.party}</Text>
          <Text style={styles.transactionSubtitle}>{transaction.reference}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          {formatCurrency(transaction.amount)}
        </Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: transaction.status === 'paid' ? '#dcfce7' : '#fef3c7' 
        }]}>
          <Text style={[styles.statusText, { 
            color: transaction.status === 'paid' ? '#166534' : '#92400e' 
          }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back! Here's your business overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {dashboardData?.reminders && dashboardData.reminders.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{dashboardData.reminders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* KPI Cards */}
          <View style={styles.kpiContainer}>
            <View style={styles.kpiRow}>
              {kpiCards.slice(0, 2).map(renderKPICard)}
            </View>
            <View style={styles.kpiRow}>
              {kpiCards.slice(2, 4).map(renderKPICard)}
            </View>
          </View>

          {/* Business Insights */}
          <View style={styles.insightsCard}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.insightsGradient}
            >
              <Text style={styles.insightsTitle}>Business Insights</Text>
              <View style={styles.insightsContent}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Profit Margin</Text>
                  <Text style={styles.insightValue}>{dashboardData?.insights.profitMargin || 0}%</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Top Customer</Text>
                  <Text style={styles.insightValue}>{dashboardData?.insights.topCustomer?.name || 'None'}</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Inventory Value</Text>
                  <Text style={styles.insightValue}>{formatCurrency(dashboardData?.insights.inventoryValue || 0)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map(renderQuickAction)}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsCard}>
              {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                dashboardData.recentTransactions.map(renderTransaction)
              ) : (
                <View style={styles.emptyTransactions}>
                  <Text style={styles.emptyTransactionsText}>No recent transactions</Text>
                  <TouchableOpacity 
                    style={styles.createSaleButton}
                    onPress={() => navigation.navigate('Invoice')}
                  >
                    <Text style={styles.createSaleButtonText}>Create First Sale</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Reminders */}
          {dashboardData?.reminders && dashboardData.reminders.length > 0 && (
            <View style={styles.remindersContainer}>
              <Text style={styles.sectionTitle}>Reminders</Text>
              {dashboardData.reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderCard}>
                  <View style={styles.reminderLeft}>
                    <View style={[styles.reminderIcon, { 
                      backgroundColor: reminder.priority === 'high' ? '#fef2f2' : '#fef3c7' 
                    }]}>
                      <Text style={styles.reminderIconText}>
                        {reminder.type === 'payment' ? '💳' : reminder.type === 'stock' ? '📦' : '📋'}
                      </Text>
                    </View>
                    <View style={styles.reminderContent}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderMessage}>{reminder.message}</Text>
                    </View>
                  </View>
                  <View style={[styles.priorityIndicator, { 
                    backgroundColor: reminder.priority === 'high' ? '#ef4444' : '#f59e0b' 
                  }]} />
                </View>
              ))}
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
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  kpiContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    width: '48%',
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
  kpiCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsGradient: {
    padding: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  insightsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
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
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
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
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  createSaleButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createSaleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  remindersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderIconText: {
    fontSize: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  reminderMessage: {
    fontSize: 12,
    color: '#64748b',
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
});

export default DashboardScreen;
