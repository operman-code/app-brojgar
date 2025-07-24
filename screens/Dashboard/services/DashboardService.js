// screens/Dashboard/services/DashboardService.js
import DatabaseService from '../../../database/DatabaseService';

class DashboardService {
  // Get comprehensive KPI data for dashboard cards
  static async getKPIData() {
    try {
      const [
        toCollect,
        toPay,
        stockValue,
        weekSales,
        toCollectTrend,
        toPayTrend,
        stockTrend,
        salesTrend
      ] = await Promise.all([
        this.getTotalReceivables(),
        this.getTotalPayables(),
        this.getInventoryValue(),
        this.getWeekSales(),
        this.getReceivablesTrend(),
        this.getPayablesTrend(),
        this.getStockTrend(),
        this.getSalesTrend()
      ]);

      return {
        toCollect,
        toPay,
        stockValue,
        weekSales,
        toCollectTrend,
        toPayTrend,
        stockTrend,
        salesTrend
      };
    } catch (error) {
      console.error('❌ Error getting KPI data:', error);
      return {
        toCollect: 0,
        toPay: 0,
        stockValue: 0,
        weekSales: 0,
        toCollectTrend: 0,
        toPayTrend: 0,
        stockTrend: 0,
        salesTrend: 0
      };
    }
  }

  // Get business reminders
  static async getReminders() {
    try {
      const query = `
        SELECT 
          id,
          title,
          message as subtitle,
          type,
          created_at,
          related_id,
          related_type
        FROM notifications 
        WHERE deleted_at IS NULL 
          AND read_at IS NULL
          AND type IN ('payment_reminder', 'low_stock', 'gst_filing', 'backup_reminder')
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      const reminders = await DatabaseService.executeQuery(query);
      
      return reminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        subtitle: reminder.subtitle,
        icon: this.getReminderIcon(reminder.type),
        color: this.getReminderColor(reminder.type),
        amount: 0 // Will be populated based on type
      }));
    } catch (error) {
      console.error('❌ Error getting reminders:', error);
      return [];
    }
  }

  // Get recent notifications
  static async getNotifications() {
    try {
      const query = `
        SELECT 
          id,
          title,
          message,
          type,
          created_at,
          read_at
        FROM notifications 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  }

  // Get sales chart data for the last 7 days
  static async getSalesChartData() {
    try {
      const query = `
        SELECT 
          DATE(i.date) as date,
          SUM(i.total) as total
        FROM invoices i
        WHERE i.deleted_at IS NULL 
          AND i.date >= date('now', '-7 days')
        GROUP BY DATE(i.date)
        ORDER BY date ASC
      `;
      
      const salesData = await DatabaseService.executeQuery(query);
      
      // Fill in missing days with 0 sales
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = salesData.find(d => d.date === dateStr);
        chartData.push({
          date: dateStr,
          total: dayData ? dayData.total : 0,
          label: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
      
      return chartData;
    } catch (error) {
      console.error('❌ Error getting sales chart data:', error);
      return [];
    }
  }

  // Get business profile
  static async getBusinessProfile() {
    try {
      const query = `
        SELECT key, value 
        FROM business_settings 
        WHERE deleted_at IS NULL 
          AND key IN ('business_name', 'business_email', 'business_phone', 'business_address')
      `;
      
      const settings = await DatabaseService.executeQuery(query);
      const profile = {};
      
      settings.forEach(setting => {
        const key = setting.key.replace('business_', '');
        profile[key] = setting.value;
      });
      
      return {
        businessName: profile.name || 'Brojgar Business',
        businessEmail: profile.email || '',
        businessPhone: profile.phone || '',
        businessAddress: profile.address || ''
      };
    } catch (error) {
      console.error('❌ Error getting business profile:', error);
      return {
        businessName: 'Brojgar Business',
        businessEmail: '',
        businessPhone: '',
        businessAddress: ''
      };
    }
  }

  // Helper methods for KPI calculations
  static async getTotalReceivables() {
    try {
      const query = `
        SELECT COALESCE(SUM(total - COALESCE(paid_amount, 0)), 0) as receivables
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND status != 'paid'
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.receivables || 0;
    } catch (error) {
      console.error('❌ Error getting receivables:', error);
      return 0;
    }
  }

  static async getTotalPayables() {
    try {
      const query = `
        SELECT COALESCE(SUM(amount), 0) as payables
        FROM transactions 
        WHERE deleted_at IS NULL 
          AND type = 'expense'
          AND status = 'pending'
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.payables || 0;
    } catch (error) {
      console.error('❌ Error getting payables:', error);
      return 0;
    }
  }

  static async getInventoryValue() {
    try {
      const query = `
        SELECT COALESCE(SUM(stock_quantity * selling_price), 0) as inventory_value
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.inventory_value || 0;
    } catch (error) {
      console.error('❌ Error getting inventory value:', error);
      return 0;
    }
  }

  static async getWeekSales() {
    try {
      const query = `
        SELECT COALESCE(SUM(total), 0) as week_sales
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND date >= date('now', '-7 days')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.week_sales || 0;
    } catch (error) {
      console.error('❌ Error getting week sales:', error);
      return 0;
    }
  }

  // Trend calculation methods (simplified for now)
  static async getReceivablesTrend() {
    return Math.floor(Math.random() * 20) - 10; // Random between -10 and +10
  }

  static async getPayablesTrend() {
    return Math.floor(Math.random() * 20) - 10;
  }

  static async getStockTrend() {
    return Math.floor(Math.random() * 20) - 10;
  }

  static async getSalesTrend() {
    return Math.floor(Math.random() * 20) - 10;
  }

  // Helper methods for reminders
  static getReminderIcon(type) {
    const icons = {
      payment_reminder: '💰',
      low_stock: '📦',
      gst_filing: '📄',
      backup_reminder: '💾'
    };
    return icons[type] || '🔔';
  }

  static getReminderColor(type) {
    const colors = {
      payment_reminder: '#10b981',
      low_stock: '#f59e0b',
      gst_filing: '#3b82f6',
      backup_reminder: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  }

  // Existing methods from previous implementation
  static async getTodaySales() {
    try {
      const query = `
        SELECT COALESCE(SUM(total), 0) as today_sales
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND date = date('now')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.today_sales || 0;
    } catch (error) {
      console.error('❌ Error getting today sales:', error);
      return 0;
    }
  }

  static async getMonthSales() {
    try {
      const query = `
        SELECT COALESCE(SUM(total), 0) as month_sales
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.month_sales || 0;
    } catch (error) {
      console.error('❌ Error getting month sales:', error);
      return 0;
    }
  }

  static async getTotalCustomers() {
    try {
      const query = `
        SELECT COUNT(*) as total_customers
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'customer' OR type = 'both')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total_customers || 0;
    } catch (error) {
      console.error('❌ Error getting total customers:', error);
      return 0;
    }
  }

  static async getTotalSuppliers() {
    try {
      const query = `
        SELECT COUNT(*) as total_suppliers
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'supplier' OR type = 'both')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total_suppliers || 0;
    } catch (error) {
      console.error('❌ Error getting total suppliers:', error);
      return 0;
    }
  }

  static async getLowStockItems() {
    try {
      const query = `
        SELECT *
        FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND stock_quantity <= min_stock_level
        ORDER BY stock_quantity ASC
        LIMIT 5
      `;
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting low stock items:', error);
      return [];
    }
  }

  static async getRecentTransactions() {
    try {
      const query = `
        SELECT 
          t.*,
          p.name as customer
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC
        LIMIT 10
      `;
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting recent transactions:', error);
      return [];
    }
  }

  static async getPendingPayments() {
    try {
      const query = `
        SELECT 
          i.*,
          p.name as customer_name,
          (i.total - COALESCE(i.paid_amount, 0)) as pending_amount
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL 
          AND i.total > COALESCE(i.paid_amount, 0)
        ORDER BY i.due_date ASC
        LIMIT 5
      `;
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting pending payments:', error);
      return [];
    }
  }

  static async getTopSellingItems() {
    try {
      const query = `
        SELECT 
          inv.item_name,
          SUM(ii.quantity) as total_quantity,
          SUM(ii.total) as total_sales
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        JOIN inventory_items inv ON ii.item_id = inv.id
        WHERE i.deleted_at IS NULL 
          AND ii.deleted_at IS NULL
          AND inv.deleted_at IS NULL
        GROUP BY inv.id, inv.item_name
        ORDER BY total_sales DESC
        LIMIT 5
      `;
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting top selling items:', error);
      return [];
    }
  }

  static async getSalesGrowth() {
    try {
      const thisMonthQuery = `
        SELECT COALESCE(SUM(total), 0) as current_month
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
      `;
      
      const lastMonthQuery = `
        SELECT COALESCE(SUM(total), 0) as last_month
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND strftime('%Y-%m', date) = strftime('%Y-%m', date('now', '-1 month'))
      `;
      
      const [thisMonth, lastMonth] = await Promise.all([
        DatabaseService.executeQuery(thisMonthQuery),
        DatabaseService.executeQuery(lastMonthQuery)
      ]);
      
      const currentMonth = thisMonth[0]?.current_month || 0;
      const previousMonth = lastMonth[0]?.last_month || 0;
      
      if (previousMonth === 0) return 0;
      
      return ((currentMonth - previousMonth) / previousMonth) * 100;
    } catch (error) {
      console.error('❌ Error getting sales growth:', error);
      return 0;
    }
  }

  static async getProfitMargin() {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(ii.total), 0) as total_sales,
          COALESCE(SUM(ii.quantity * inv.cost_price), 0) as total_cost
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        JOIN inventory_items inv ON ii.item_id = inv.id
        WHERE i.deleted_at IS NULL 
          AND ii.deleted_at IS NULL
          AND inv.deleted_at IS NULL
          AND strftime('%Y-%m', i.date) = strftime('%Y-%m', 'now')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const sales = result[0]?.total_sales || 0;
      const cost = result[0]?.total_cost || 0;
      
      if (sales === 0) return 0;
      
      return ((sales - cost) / sales) * 100;
    } catch (error) {
      console.error('❌ Error getting profit margin:', error);
      return 0;
    }
  }

  static async getTopCustomer() {
    try {
      const query = `
        SELECT 
          p.name,
          COALESCE(SUM(i.total), 0) as total_purchases
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.deleted_at IS NULL
        WHERE p.deleted_at IS NULL 
          AND (p.type = 'customer' OR p.type = 'both')
        GROUP BY p.id, p.name
        ORDER BY total_purchases DESC
        LIMIT 1
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0] || { name: 'No customers yet', total_purchases: 0 };
    } catch (error) {
      console.error('❌ Error getting top customer:', error);
      return { name: 'No customers yet', total_purchases: 0 };
    }
  }

  // Get dashboard data (legacy method for compatibility)
  static async getDashboardData() {
    try {
      const [
        kpis,
        recentTransactions,
        reminders,
        notifications,
        salesChartData,
        businessProfile
      ] = await Promise.all([
        this.getKPIData(),
        this.getRecentTransactions(),
        this.getReminders(),
        this.getNotifications(),
        this.getSalesChartData(),
        this.getBusinessProfile()
      ]);

      return {
        kpis,
        recentTransactions,
        reminders,
        notifications,
        salesChartData,
        businessProfile
      };
    } catch (error) {
      console.error('❌ Error getting dashboard data:', error);
      return {};
    }
  }

  // Utility methods
  static formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  }

  static formatCurrency(amount) {
    try {
      return `₹${amount.toLocaleString('en-IN')}`;
    } catch (error) {
      return `₹${amount}`;
    }
  }
}

export default DashboardService;
