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
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [businessData, setBusinessData] = useState({
    todaySales: 45000,
    monthSales: 234000,
    totalCustomers: 156,
    pendingPayments: 89000
  });

  useEffect(() => {
    // Smooth entry animation
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
  }, []);

  const quickActions = [
    { id: 1, title: 'Create Invoice', icon: '📄', color: '#3b82f6', bgColor: '#eff6ff', action: () => navigation.navigate('Invoice') },
    { id: 2, title: 'Add Customer', icon: '👤', color: '#10b981', bgColor: '#ecfdf5', action: () => navigation.navigate('Parties') },
    { id: 3, title: 'Add Item', icon: '📦', color: '#f59e0b', bgColor: '#fffbeb', action: () => navigation.navigate('Inventory') },
    { id: 4, title: 'Record Payment', icon: '💰', color: '#8b5cf6', bgColor: '#f3e8ff', action: () => navigation.navigate('Dashboard') },
    { id: 5, title: 'View Reports', icon: '📊', color: '#ef4444', bgColor: '#fef2f2', action: () => navigation.navigate('Reports') },
    { id: 6, title: 'Send Reminder', icon: '🔔', color: '#06b6d4', bgColor: '#ecfeff', action: () => navigation.navigate('Notifications') },
  ];

  const recentTransactions = [
    { id: 1, customer: 'Rajesh Kumar', amount: 15000, type: 'sale', time: '2 hours ago', status: 'paid' },
    { id: 2, customer: 'Priya Sharma', amount: 8500, type: 'sale', time: '4 hours ago', status: 'pending' },
    { id: 3, customer: 'Tech Suppliers Ltd', amount: 25000, type: 'purchase', time: '1 day ago', status: 'paid' },
    { id: 4, customer: 'Mobile World', amount: 12000, type: 'sale', time: '2 days ago', status: 'overdue' },
  ];

  const renderStatCard = (title, value, icon, trend, trendValue) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>₹{value.toLocaleString()}</Text>
      <View style={styles.statTrend}>
        <Text style={[styles.trendText, { color: trend === 'up' ? '#10b981' : '#ef4444' }]}>
          {trend === 'up' ? '↗' : '↘'} {trendValue}%
        </Text>
        <Text style={styles.trendLabel}>vs last month</Text>
      </View>
    </View>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={item.action}>
      <View style={[styles.quickActionIcon, { backgroundColor: item.bgColor }]}>
        <Text style={styles.quickActionEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionTypeIcon, { 
          backgroundColor: item.type === 'sale' ? '#ecfdf5' : '#fef2f2' 
        }]}>
          <Text style={styles.transactionTypeEmoji}>
            {item.type === 'sale' ? '📤' : '📥'}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionCustomer}>{item.customer}</Text>
          <Text style={styles.transactionTime}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, {
          color: item.type === 'sale' ? '#10b981' : '#ef4444'
        }]}>
          {item.type === 'sale' ? '+' : '-'}₹{item.amount.toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, {
          backgroundColor: getStatusColor(item.status).bg
        }]}>
          <Text style={[styles.statusText, {
            color: getStatusColor(item.status).text
          }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return { bg: '#dcfce7', text: '#166534' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'overdue':
        return { bg: '#fecaca', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.businessName}>MyBusiness Store</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Search')}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>📈 Business Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Today Sales', businessData.todaySales, '💰', 'up', '12')}
              {renderStatCard('This Month', businessData.monthSales, '📊', 'up', '8')}
              {renderStatCard('Total Customers', businessData.totalCustomers, '👥', 'up', '15')}
              {renderStatCard('Pending Payments', businessData.pendingPayments, '⏰', 'down', '5')}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <FlatList
              data={quickActions}
              renderItem={renderQuickAction}
              numColumns={3}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsGrid}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💼 Recent Transactions</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsList}>
              <FlatList
                data={recentTransactions}
                renderItem={renderTransaction}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>

          {/* Business Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>💡 Business Insights</Text>
            <View style={styles.insightCard}>
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.insightGradient}
              >
                <Text style={styles.insightTitle}>Your best selling month!</Text>
                <Text style={styles.insightDescription}>
                  This month you've made 25% more sales than last month. Keep up the great work!
                </Text>
                <TouchableOpacity style={styles.insightButton} onPress={() => navigation.navigate('Reports')}>
                  <Text style={styles.insightButtonText}>View Details</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 20,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statIcon: {
    fontSize: 16,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActionsGrid: {
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 3,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTypeEmoji: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  insightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  insightGradient: {
    padding: 24,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 20,
  },
  insightButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DashboardScreen;