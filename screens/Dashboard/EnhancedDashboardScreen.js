import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
} from "react-native";

// Import existing components
import KPICard from "./components/KPICard";
import TransactionItem from "./components/TransactionItem";
import QuickActionButton from "./components/QuickActionButton";
import NotificationCard from "./components/NotificationCard";

// Import service
import DashboardService from "./services/DashboardService";

const { width } = Dimensions.get('window');

const EnhancedDashboardScreen = ({ navigation, route }) => {
  // Enhanced state management
  const [kpiData, setKpiData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [businessProfile, setBusinessProfile] = useState({});
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadDashboardData();
    
    // Enhanced animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        kpiResult,
        transactionsResult,
        remindersResult,
        notificationsResult,
        profileResult
      ] = await Promise.all([
        DashboardService.getKPIData(),
        DashboardService.getRecentTransactions(),
        DashboardService.getReminders(),
        DashboardService.getNotifications(),
        DashboardService.getBusinessProfile()
      ]);

      setKpiData(kpiResult);
      setRecentTransactions(transactionsResult);
      setReminders(remindersResult);
      setNotifications(notificationsResult);
      setBusinessProfile(profileResult);
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderKPISection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Business Overview</Text>
      <View style={styles.kpiContainer}>
        <KPICard
          title="Total Sales"
          value={kpiData.totalSales || "₹0"}
          change={kpiData.salesChange || "+0%"}
          isPositive={true}
          icon="💰"
        />
        <KPICard
          title="Total Purchases"
          value={kpiData.totalPurchases || "₹0"}
          change={kpiData.purchasesChange || "+0%"}
          isPositive={false}
          icon="🛒"
        />
        <KPICard
          title="Profit"
          value={kpiData.profit || "₹0"}
          change={kpiData.profitChange || "+0%"}
          isPositive={true}
          icon="📈"
        />
        <KPICard
          title="Parties"
          value={kpiData.totalParties || "0"}
          change={kpiData.partiesChange || "+0"}
          isPositive={true}
          icon="👥"
        />
      </View>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <QuickActionButton
          title="New Sale"
          icon="💰"
          onPress={() => navigation.navigate("Invoice", { type: "sale" })}
          color="#10b981"
        />
        <QuickActionButton
          title="New Purchase"
          icon="🛒"
          onPress={() => navigation.navigate("Invoice", { type: "purchase" })}
          color="#f59e0b"
        />
        <QuickActionButton
          title="Add Party"
          icon="👤"
          onPress={() => navigation.navigate("Parties", { action: "add" })}
          color="#3b82f6"
        />
        <QuickActionButton
          title="Add Item"
          icon="📦"
          onPress={() => navigation.navigate("Inventory", { action: "add" })}
          color="#8b5cf6"
        />
      </View>
    </Animated.View>
  );

  const renderRecentActivity = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Reports")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentTransactions.length > 0 ? (
        <FlatList
          data={recentTransactions.slice(0, 5)}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => navigation.navigate("Invoice", { transactionId: item.id })}
            />
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateText}>No recent transactions</Text>
          <Text style={styles.emptyStateSubtext}>Start by creating your first invoice</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderNotifications = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {notifications.length > 0 ? (
        notifications.slice(0, 3).map((notification, index) => (
          <NotificationCard
            key={notification.id || index}
            notification={notification}
            onPress={() => navigation.navigate("Notifications")}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔔</Text>
          <Text style={styles.emptyStateText}>No notifications</Text>
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderKPISection()}
      {renderQuickActions()}
      {renderRecentActivity()}
      {renderNotifications()}
      
      {/* Bottom padding for FAB */}
      <View style={styles.bottomPadding} />
    </ScrollView>
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 8,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});

export default EnhancedDashboardScreen;