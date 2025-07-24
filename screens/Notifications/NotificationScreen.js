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
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import NotificationService from './services/NotificationService';

const NotificationScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedTab, setSelectedTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const tabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { key: 'reminders', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length },
    { key: 'alerts', label: 'Alerts', count: notifications.filter(n => n.type === 'alert').length },
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedTab) {
      case 'unread':
        return !notification.read;
      case 'reminders':
        return notification.type === 'reminder';
      case 'alerts':
        return notification.type === 'alert';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'alert': return '⚠️';
      case 'sale': return '💰';
      case 'system': return '⚙️';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📱';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.clearAllNotifications();
              setNotifications([]);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
      onPress={() => setSelectedTab(tab.key)}
    >
      <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
        {tab.label}
      </Text>
      {tab.count > 0 && (
        <View style={[styles.tabBadge, selectedTab === tab.key && styles.activeTabBadge]}>
          <Text style={[styles.tabBadgeText, selectedTab === tab.key && styles.activeTabBadgeText]}>
            {tab.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadNotification]}
      onPress={() => openNotificationDetail(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationLeft}>
          <View style={[styles.notificationIcon, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={styles.notificationIconText}>{getNotificationIcon(item.type)}</Text>
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.notificationRight}>
          {!item.read && <View style={styles.unreadDot} />}
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={markAllAsRead}>
            <Text style={styles.quickActionIcon}>✓</Text>
            <Text style={styles.quickActionText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={clearAllNotifications}>
            <Text style={styles.quickActionIcon}>🗑️</Text>
            <Text style={styles.quickActionText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {tabs.map(renderTab)}
            </View>
          </ScrollView>
        </View>

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyMessage}>
                {selectedTab === 'all' 
                  ? 'You\'re all caught up! No new notifications.'
                  : `No ${selectedTab} notifications found.`
                }
              </Text>
            </View>
          }
        />

        {/* Notification Detail Modal */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notification Details</Text>
              <TouchableOpacity onPress={() => {
                deleteNotification(selectedNotification?.id);
                setModalVisible(false);
              }}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            {selectedNotification && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modalNotificationCard}>
                  <View style={styles.modalNotificationHeader}>
                    <View style={[styles.modalNotificationIcon, { backgroundColor: getPriorityColor(selectedNotification.priority) + '20' }]}>
                      <Text style={styles.modalNotificationIconText}>
                        {getNotificationIcon(selectedNotification.type)}
                      </Text>
                    </View>
                    <View style={styles.modalNotificationInfo}>
                      <Text style={styles.modalNotificationTitle}>{selectedNotification.title}</Text>
                      <Text style={styles.modalNotificationTime}>{selectedNotification.time}</Text>
                      <View style={styles.modalNotificationMeta}>
                        <View style={[styles.modalTypeBadge, { backgroundColor: getPriorityColor(selectedNotification.priority) }]}>
                          <Text style={styles.modalTypeBadgeText}>{selectedNotification.priority.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.modalNotificationType}>{selectedNotification.type}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.modalNotificationBody}>
                    <Text style={styles.modalNotificationMessage}>{selectedNotification.message}</Text>
                    <Text style={styles.modalNotificationDetails}>{selectedNotification.details}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  {selectedNotification.type === 'reminder' && (
                    <TouchableOpacity style={[styles.modalActionButton, styles.primaryActionButton]}>
                      <Text style={[styles.modalActionText, styles.primaryActionText]}>Take Action</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.modalActionButton}>
                    <Text style={styles.modalActionText}>Snooze</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionButton}>
                    <Text style={styles.modalActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  markAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8fafc',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabBadge: {
    marginLeft: 8,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabBadgeText: {
    color: '#ffffff',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalDeleteText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalNotificationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  modalNotificationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalNotificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalNotificationIconText: {
    fontSize: 24,
  },
  modalNotificationInfo: {
    flex: 1,
  },
  modalNotificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalNotificationTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  modalNotificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  modalTypeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalNotificationType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  modalNotificationBody: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalNotificationMessage: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalNotificationDetails: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  modalActions: {
    gap: 12,
  },
  modalActionButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  primaryActionButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  primaryActionText: {
    color: '#ffffff',
  },
});

export default NotificationScreen;
