// screens/Notifications/services/NotificationService.js
import DatabaseService from '../../../database/DatabaseService';

class NotificationService {
  // Initialize the notification service
  static async init() {
    try {
      // Service is ready, database is already initialized
      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      throw error;
    }
  }

  // Get all notifications
  static async getAllNotifications() {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result || [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  // Get notifications by type
  static async getNotificationsByType(type) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE deleted_at IS NULL 
          AND type = ?
        ORDER BY created_at DESC
      `;
      
      const result = await DatabaseService.executeQuery(query, [type]);
      return result || [];
    } catch (error) {
      console.error('❌ Error fetching notifications by type:', error);
      return [];
    }
  }

  // Get unread notifications
  static async getUnreadNotifications() {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE deleted_at IS NULL 
          AND read_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result || [];
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error);
      return [];
    }
  }

  // Get unread count
  static async getUnreadCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE deleted_at IS NULL 
          AND read_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const query = `
        UPDATE notifications 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      await DatabaseService.executeQuery(query, [notificationId]);
      console.log('✅ Notification marked as read');
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      const query = `
        UPDATE notifications 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE deleted_at IS NULL 
          AND read_at IS NULL
      `;
      
      await DatabaseService.executeQuery(query);
      console.log('✅ All notifications marked as read');
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const query = `
        UPDATE notifications 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [notificationId]);
      console.log('✅ Notification deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return false;
    }
  }

  // Clear all notifications
  static async clearAllNotifications() {
    try {
      const query = `
        UPDATE notifications 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE deleted_at IS NULL
      `;
      
      await DatabaseService.executeQuery(query);
      console.log('✅ All notifications cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      return false;
    }
  }

  // Create new notification
  static async createNotification(notificationData) {
    try {
      const query = `
        INSERT INTO notifications (title, message, type, action_url, related_id, related_type) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        notificationData.title,
        notificationData.message || '',
        notificationData.type || 'info',
        notificationData.action_url || null,
        notificationData.related_id || null,
        notificationData.related_type || null
      ];
      
      await DatabaseService.executeQuery(query, params);
      console.log('✅ Notification created');
      return true;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return false;
    }
  }

  // Create specific notification types
  static async createPaymentReminderNotification(invoiceId, customerName, amount) {
    return this.createNotification({
      title: 'Payment Reminder',
      message: `Payment due from ${customerName} - ₹${amount}`,
      type: 'payment_reminder',
      related_id: invoiceId,
      related_type: 'invoice'
    });
  }

  static async createLowStockAlert(itemId, itemName, currentStock) {
    return this.createNotification({
      title: 'Low Stock Alert',
      message: `${itemName} is running low (${currentStock} remaining)`,
      type: 'low_stock',
      related_id: itemId,
      related_type: 'inventory_item'
    });
  }

  static async createGSTFilingReminder() {
    return this.createNotification({
      title: 'GST Filing Due',
      message: 'Monthly GST return filing is due soon',
      type: 'gst_filing'
    });
  }

  static async createBackupReminder() {
    return this.createNotification({
      title: 'Backup Reminder',
      message: 'Time to backup your business data',
      type: 'backup_reminder'
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
      console.error('❌ Error checking automatic notifications:', error);
    }
  }

  static async checkPaymentDueReminders() {
    try {
      // Check for overdue invoices
      const query = `
        SELECT i.*, p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL 
          AND i.due_date < date('now')
          AND i.total > COALESCE(i.paid_amount, 0)
      `;
      
      const overdueInvoices = await DatabaseService.executeQuery(query);
      
      for (const invoice of overdueInvoices) {
        await this.createPaymentReminderNotification(
          invoice.id,
          invoice.customer_name || 'Customer',
          invoice.total - (invoice.paid_amount || 0)
        );
      }
    } catch (error) {
      console.error('Error checking payment due reminders:', error);
    }
  }

  static async checkLowStockAlerts() {
    try {
      const query = `
        SELECT * FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND stock_quantity <= min_stock_level
      `;
      
      const lowStockItems = await DatabaseService.executeQuery(query);
      
      for (const item of lowStockItems) {
        await this.createLowStockAlert(
          item.id,
          item.item_name,
          item.stock_quantity
        );
      }
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
    }
  }

  static async checkGSTFilingReminders() {
    try {
      const today = new Date();
      const isFilingTime = today.getDate() >= 18 && today.getDate() <= 20;
      
      if (isFilingTime) {
        await this.createGSTFilingReminder();
      }
    } catch (error) {
      console.error('Error checking GST filing reminders:', error);
    }
  }

  static async checkBackupReminders() {
    try {
      // Check if backup is due (every 7 days)
      const lastBackup = await DatabaseService.executeQuery(
        'SELECT MAX(created_at) as last_backup FROM backups WHERE deleted_at IS NULL'
      );
      
      if (!lastBackup[0]?.last_backup) {
        await this.createBackupReminder();
      } else {
        const lastBackupDate = new Date(lastBackup[0].last_backup);
        const daysSinceBackup = (new Date() - lastBackupDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceBackup >= 7) {
          await this.createBackupReminder();
        }
      }
    } catch (error) {
      console.error('Error checking backup reminders:', error);
    }
  }
}

export default NotificationService;
