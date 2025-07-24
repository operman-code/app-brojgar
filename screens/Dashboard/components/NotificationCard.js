// screens/Dashboard/components/NotificationCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationCard = ({ notification, onPress, onDismiss }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment_reminder':
        return '💰';
      case 'low_stock':
        return '📦';
      case 'gst_filing':
        return '📄';
      case 'backup_reminder':
        return '💾';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment_reminder':
        return '#10b981';
      case 'low_stock':
        return '#f59e0b';
      case 'gst_filing':
        return '#3b82f6';
      case 'backup_reminder':
        return '#8b5cf6';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(notification.type) + '20' }]}>
          <Text style={styles.icon}>{getTypeIcon(notification.type)}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.timestamp}>
            {formatDate(notification.created_at)}
          </Text>
        </View>
        {!notification.read_at && <View style={styles.unreadDot} />}
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
    marginTop: 6,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});

export default NotificationCard;
