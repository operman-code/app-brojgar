// screens/Notifications/services/NotificationService.js
import DatabaseService from '../../../database/DatabaseService';

class NotificationService {
  static async getAllNotifications(limit = 50) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM notifications 
        WHERE (deleted_at IS NULL OR deleted_at = '') 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [limit]);
      return result.rows._array.map(this.formatNotification);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async checkLowStockAlerts() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM inventory_items 
        WHERE current_stock <= min_stock 
        AND current_stock > 0
        AND (deleted_at IS NULL OR deleted_at = '')
        AND id NOT IN (
          SELECT COALESCE(CAST(action_url AS INTEGER), 0) FROM notifications 
          WHERE type = 'stock_alert' 
          AND created_at > date('now', '-1 day')
          AND (deleted_at IS NULL OR deleted_at = '')
        )
      `;
      
      const result = await DatabaseService.executeQuery(query);
      
      for (const item of result.rows._array) {
        await this.createLowStockAlert(item);
      }
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
    }
  }

  static async checkPaymentDueReminders() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT i.*, p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.status = 'pending' 
        AND date(i.due_date) <= date('now', '+7 days')
        AND (i.deleted_at IS NULL OR i.deleted_at = '')
        AND i.id NOT IN (
          SELECT COALESCE(CAST(action_url AS INTEGER), 0) FROM notifications 
          WHERE type = 'payment_reminder' 
          AND created_at > date('now', '-1 day')
          AND (deleted_at IS NULL OR deleted_at = '')
        )
      `;
      
      const result = await DatabaseService.executeQuery(query);
      
      for (const invoice of result.rows._array) {
        await this.createPaymentReminderNotification(invoice);
      }
    } catch (error) {
      console.error('Error checking payment due reminders:', error);
    }
  }

  static async createNotification(notificationData) {
    try {
      await DatabaseService.init();
      
      const {
        title,
        message,
        type = 'info',
        priority = 'medium',
        actionUrl = null
      } = notificationData;
      
      const query = `
        INSERT INTO notifications (
          title, message, type, priority, action_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = await DatabaseService.executeQuery(query, [
        title, message, type, priority, actionUrl
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async createLowStockAlert(itemData) {
    return await this.createNotification({
      title: `Low Stock Alert - ${itemData.name}`,
      message: `Only ${itemData.current_stock} units left. Minimum required: ${itemData.min_stock}`,
      type: 'stock_alert',
      priority: 'high',
      actionUrl: itemData.id.toString()
    });
  }

  static async createPaymentReminderNotification(invoiceData) {
    const daysOverdue = this.calculateDaysOverdue(invoiceData.due_date);
    
    return await this.createNotification({
      title: `Payment Overdue - ${invoiceData.customer_name}`,
      message: `Invoice ${invoiceData.invoice_number} is ${daysOverdue} days overdue. Amount: ₹${invoiceData.total}`,
      type: 'payment_reminder',
      priority: daysOverdue > 30 ? 'high' : 'medium',
      actionUrl: invoiceData.id.toString()
    });
  }

  static async checkAndCreateAutomaticNotifications() {
    try {
      await Promise.all([
        this.checkPaymentDueReminders(),
        this.checkLowStockAlerts()
      ]);
    } catch (error) {
      console.error('Error checking automatic notifications:', error);
    }
  }

  static formatNotification(notification) {
    return {
      ...notification,
      timeAgo: this.getTimeAgo(notification.created_at),
      isRead: !!notification.read_at,
      icon: this.getNotificationIcon(notification.type),
      color: this.getNotificationColor(notification.type)
    };
  }

  static getNotificationIcon(type) {
    const icons = {
      'payment_reminder': '💰',
      'stock_alert': '📦',
      'info': 'ℹ️',
      'warning': '⚠️',
      'success': '✅',
      'error': '❌'
    };
    return icons[type] || 'ℹ️';
  }

  static getNotificationColor(type) {
    const colors = {
      'payment_reminder': '#f59e0b',
      'stock_alert': '#ef4444',
      'info': '#3b82f6',
      'warning': '#f59e0b',
      'success': '#10b981',
      'error': '#ef4444'
    };
    return colors[type] || '#3b82f6';
  }

  static getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  }

  static calculateDaysOverdue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default NotificationService;
