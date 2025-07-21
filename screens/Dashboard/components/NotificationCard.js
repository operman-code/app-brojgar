import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const NotificationCard = ({ notification, onPress, onDismiss }) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case "warning":
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          iconColor: "#d97706",
        };
      case "error":
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
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{getNotificationIcon(notification.type)}</Text>
          <Text style={[styles.title, { color: style.iconColor }]} numberOfLines={1}>
            {notification.title}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.message} numberOfLines={2}>
        {notification.message}
      </Text>
      
      {notification.timestamp && (
        <Text style={styles.timestamp}>
          {notification.timestamp}
        </Text>
      )}
      
      {notification.actionLabel && (
        <View style={styles.actionContainer}>
          <Text style={[styles.actionText, { color: style.iconColor }]}>
            {notification.actionLabel} →
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  dismissButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "bold",
  },
  message: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 8,
  },
  actionContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default NotificationCard;