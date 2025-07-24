// screens/Notifications/services/NotificationService.js
import DatabaseService from '../../../database/DatabaseService';

class NotificationService {
  static async getAllNotifications(limit = 50) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM notifications 
        WHERE deleted_at IS NULL 
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

  static async getNotificationsByType(type, limit = 20) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM notifications 
        WHERE type = ? AND deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [type, limit]);
      return result.rows._array.map(this.formatNotification);
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      return [];
    }
  }

  static async getUnreadNotifications() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM notifications 
        WHERE read_at IS NULL AND deleted_at IS NULL 
        ORDER BY created_at DESC
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array.map(this.formatNotification);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  static async getUnreadCount() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE read_at IS NULL AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async markAsRead(notificationId) {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE notifications 
        SET read_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [notificationId]);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllAsRead() {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE notifications 
        SET read_at = datetime('now'), updated_at = datetime('now')
        WHERE read_at IS NULL AND deleted_at IS NULL
      `;
      
      await DatabaseService.executeQuery(query);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE notifications 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [notificationId]);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  static async clearAllNotifications() {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE notifications 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE deleted_at IS NULL
      `;
      
      await DatabaseService.executeQuery(query);
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
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
        actionUrl = null,
        relatedId = null,
        relatedType = null
      } = notificationData;
      
      const query = `
        INSERT INTO notifications (
          title, message, type, priority, action_url, 
          related_id, related_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = await DatabaseService.executeQuery(query, [
        title, message, type, priority, actionUrl, relatedId, relatedType
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Business-specific notification creators
  static async createPaymentReminderNotification(invoiceData) {
    const daysOverdue = this.calculateDaysOverdue(invoiceData.dueDate);
    
    return await this.createNotification({
      title: `Payment Overdue - ${invoiceData.customer_name}`,
      message: `Invoice ${invoiceData.invoice_number} is ${daysOverdue} days overdue. Amount: ₹${invoiceData.total}`,
      type: 'payment_reminder',
      priority: daysOverdue > 30 ? 'high' : 'medium',
      relatedId: invoiceData.id,
      relatedType: 'invoice'
    });
  }

  static async createLowStockAlert(itemData) {
    return await this.createNotification({
      title: `Low Stock Alert - ${itemData.name}`,
      message: `Only ${itemData.current_stock} units left. Minimum required: ${itemData.min_stock}`,
      type: 'stock_alert',
      priority: 'high',
      relatedId: itemData.id,
      relatedType: 'inventory_item'
    });
  }

  static async createGSTFilingReminder(period) {
    return await this.createNotification({
      title: 'GST Filing Due',
      message: `GST filing for ${period} is due soon. Please prepare your returns.`,
      type: 'gst_reminder',
      priority: 'high',
      relatedType: 'gst_filing'
    });
  }

  static async createBackupReminder() {
    return await this.createNotification({
      title: 'Data Backup Reminder',
      message: 'It\'s time to backup your business data. Tap to start backup process.',
      type: 'backup_reminder',
      priority: 'medium',
      actionUrl: 'backup'
    });
  }

  // Check and create automatic notifications
  static async checkAndCreateAutomaticNotifications() {
    try {
      await Promise.all([
        this.checkPaymentDueReminders(),
        this.checkLowStockAlerts(),
        this.checkGSTFilingReminders(),
        this.checkBackupReminders()
      ]);
    } catch (error) {
      console.error('Error checking automatic notifications:', error);
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
        AND i.id NOT IN (
          SELECT related_id FROM notifications 
          WHERE type = 'payment_reminder' 
          AND related_type = 'invoice' 
          AND created_at > date('now', '-1 day')
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

  static async checkLowStockAlerts() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM inventory_items 
        WHERE current_stock <= min_stock 
        AND current_stock > 0
        AND id NOT IN (
          SELECT related_id FROM notifications 
          WHERE type = 'stock_alert' 
          AND related_type = 'inventory_item' 
          AND created_at > date('now', '-1 day')
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

  static async checkGSTFilingReminders() {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const dayOfMonth = now.getDate();
      
      // Check if it's between 15th-20th of the month for previous month's GST
      if (dayOfMonth >= 15 && dayOfMonth <= 20) {
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const year = currentMonth === 1 ? currentYear - 1 : currentYear;
        const period = `${String(previousMonth).padStart(2, '0')}/${year}`;
        
        // Check if reminder already sent for this period
        const existingQuery = `
          SELECT COUNT(*) as count FROM notifications 
          WHERE type = 'gst_reminder' 
          AND message LIKE '%${period}%' 
          AND created_at > date('now', '-7 days')
        `;
        
        const existing = await DatabaseService.executeQuery(existingQuery);
        if (existing.rows._array[0].count === 0) {
          await this.createGSTFilingReminder(period);
        }
      }
    } catch (error) {
      console.error('Error checking GST filing reminders:', error);
    }
  }

  static async checkBackupReminders() {
    try {
      await DatabaseService.init();
      
      // Check if last backup reminder was more than 7 days ago
      const query = `
        SELECT created_at FROM notifications 
        WHERE type = 'backup_reminder' 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await DatabaseService.executeQuery(query);
      
      if (result.rows._array.length === 0) {
        // No backup reminder ever sent
        await this.createBackupReminder();
      } else {
        const lastReminder = new Date(result.rows._array[0].created_at);
        const daysDiff = (new Date() - lastReminder) / (1000 * 60 * 60 * 24);
        
        if (daysDiff >= 7) {
          await this.createBackupReminder();
        }
      }
    } catch (error) {
      console.error('Error checking backup reminders:', error);
    }
  }

  // Utility functions
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
      'gst_reminder': '📄',
      'backup_reminder': '💾',
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
      'gst_reminder': '#8b5cf6',
      'backup_reminder': '#06b6d4',
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
