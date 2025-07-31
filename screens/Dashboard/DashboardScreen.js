// screens/Dashboard/DashboardScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Import services
import DashboardService from "./services/DashboardService";

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalParties: 0,
    totalItems: 0,
    recentTransactions: [],
    lowStockItems: [],
    notifications: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#3b82f6" />
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingIcon}>📊</Text>
            <Text style={styles.loadingText}>Loading Dashboard...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3b82f6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.businessName}>Brojgar Business</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.kpiGrid}>
            <TouchableOpacity style={styles.kpiCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.kpiGradient}
              >
                <Text style={styles.kpiIcon}>💰</Text>
                <Text style={styles.kpiValue}>₹{dashboardData.totalSales.toLocaleString()}</Text>
                <Text style={styles.kpiLabel}>Total Sales</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.kpiCard}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.kpiGradient}
              >
                <Text style={styles.kpiIcon}>🛒</Text>
                <Text style={styles.kpiValue}>₹{dashboardData.totalPurchases.toLocaleString()}</Text>
                <Text style={styles.kpiLabel}>Total Purchases</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.kpiCard}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.kpiGradient}
              >
                <Text style={styles.kpiIcon}>👥</Text>
                <Text style={styles.kpiValue}>{dashboardData.totalParties}</Text>
                <Text style={styles.kpiLabel}>Total Parties</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.kpiCard}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.kpiGradient}
              >
                <Text style={styles.kpiIcon}>📦</Text>
                <Text style={styles.kpiValue}>{dashboardData.totalItems}</Text>
                <Text style={styles.kpiLabel}>Total Items</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Invoice')}
            >
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📄</Text>
                <Text style={styles.actionText}>Create Invoice</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Parties')}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionText}>Add Party</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Inventory')}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📦</Text>
                <Text style={styles.actionText}>Add Item</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>Reports</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {dashboardData.recentTransactions.length > 0 ? (
            dashboardData.recentTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <Text style={styles.transactionAmount}>₹{transaction.amount}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No recent transactions</Text>
            </View>
          )}
        </View>
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
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
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
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  businessName: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  kpiSection: {
    marginBottom: 24,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  kpiGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  kpiIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  noDataContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DashboardScreen;
