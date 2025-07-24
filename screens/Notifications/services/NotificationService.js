// screens/Notifications/services/NotificationService.js
import DatabaseService from '../../../database/DatabaseService';

class NotificationService {
  static async getAllNotifications() {
    try {
      await DatabaseService.init();
      const notifications = await DatabaseService.findAll('notifications', 'ORDER BY created_at DESC');
      return notifications.map(this.formatNotification);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId) {
    try {
      return await DatabaseService.update('notifications', notificationId, { read: 1 });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead() {
    try {
      return await DatabaseService.executeRun('UPDATE notifications SET read = 1 WHERE read = 0');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      return await DatabaseService.delete('notifications', notificationId);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  static async clearAllNotifications() {
    try {
      return await DatabaseService.executeRun('DELETE FROM notifications');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      throw error;
    }
  }

  static async createNotification(notificationData) {
    try {
      return await DatabaseService.create('notifications', {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        priority: notificationData.priority || 'medium',
        read: 0,
        data: notificationData.data ? JSON.stringify(notificationData.data) : null
      });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  static async getUnreadCount() {
    try {
      const result = await DatabaseService.executeQuery('SELECT COUNT(*) as count FROM notifications WHERE read = 0');
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  static formatNotification(notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      read: notification.read === 1,
      time: this.getTimeAgo(notification.created_at),
      details: notification.message,
      data: notification.data ? JSON.parse(notification.data) : null
    };
  }

  static getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
}

export default NotificationService;
