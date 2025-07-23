// screens/Dashboard/components/NotificationCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const NotificationCard = ({ notification, onPress, onDismiss }) => {
  const getNotificationStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "warning":
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          iconColor: "#d97706",
        };
      case "error":
      case "critical":
        return {
          backgroundColor: "#fee2e2",
          borderColor: "#ef4444",
          iconColor: "#dc2626",
        };
      case "success":
        return {
          backgroundColor: "#d1fae5",
          borderColor: "#10b981",
          iconColor: "#059669",
        };
      case "info":
      default:
        return {
          backgroundColor: "#dbeafe",
          borderColor: "#3b82f6",
          iconColor: "#2563eb",
        };
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "warning":
        return "⚠️";
      case "error":
      case "critical":
        return "❌";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.icon, { color: style.iconColor }]}>
            {getNotificationIcon(notification.type)}
          </Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.time}>
              {formatDate(notification.created_at || notification.timestamp)}
            </Text>
          </View>
          {onDismiss && (
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        {notification.action && (
          <Text style={[styles.action, { color: style.iconColor }]}>
            {notification.action}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: "#666",
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  action: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default NotificationCard;
