// screens/Dashboard/services/DashboardService.js
import DatabaseService from '../../../database/DatabaseService';

class DashboardService {
  static formatCurrency(amount) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  static formatDate(date) {
    if (typeof date === 'string') return date;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  }

  // Get KPI data from database
  static async getKPIData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        // Return mock data if database is not available
        return {
          toCollect: 125000,
          toPay: 45000,
          stockValue: 320000,
          weekSales: 89000,
          totalBalance: 156000,
          toCollectTrend: "+12.5%",
          toPayTrend: "-8.2%",
          stockTrend: "+5.1%",
          salesTrend: "+18.3%",
          balanceTrend: "+22.1%",
        };
      }

      // Get outstanding receivables (unpaid invoices from customers)
      const receivablesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(balance_amount), 0) as amount 
        FROM invoices 
        WHERE balance_amount > 0 AND status != 'cancelled'
      `);
      
      // Get outstanding payables (unpaid purchases to suppliers)
      const payablesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as amount 
        FROM expenses 
        WHERE expense_date <= date('now') 
        AND id NOT IN (SELECT reference_id FROM payments WHERE reference_type = 'expense')
      `);
      
      // Get stock value
      const stockResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(current_stock * cost_price), 0) as value 
        FROM items 
        WHERE is_active = 1
      `);
      
      // Get this week's sales
      const weekSalesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(paid_amount), 0) as amount 
        FROM invoices 
        WHERE invoice_date >= date('now', 'weekday 0', '-6 days')
        AND status != 'cancelled'
      `);
      
      // Get cash and bank balance from payments
      const balanceResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as amount 
        FROM payments 
        WHERE payment_date <= date('now')
      `);

      return {
        toCollect: receivablesResult?.amount || 0,
        toPay: payablesResult?.amount || 0,
        stockValue: stockResult?.value || 0,
        weekSales: weekSalesResult?.amount || 0,
        totalBalance: balanceResult?.amount || 0,
        
        // Default trends (in real app, calculate from historical data)
        toCollectTrend: "+12.5%",
        toPayTrend: "-8.2%",
        stockTrend: "+5.1%",
        salesTrend: "+18.3%",
        balanceTrend: "+22.1%",
      };
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
      return {
        toCollect: 0,
        toPay: 0,
        stockValue: 0,
        weekSales: 0,
        totalBalance: 0,
        toCollectTrend: "0%",
        toPayTrend: "0%",
        stockTrend: "0%",
        salesTrend: "0%",
        balanceTrend: "0%",
      };
    }
  }

  // Get reminders data
  static async getReminders() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        // Return mock reminders if database is not available
        return [
          {
            id: '1',
            title: 'Payment Due',
            subtitle: 'ABC Electronics - Invoice #001',
            amount: 25000,
            color: '#ef4444',
            icon: '💳',
            type: 'payment_due',
            dueDate: '2024-01-30'
          },
          {
            id: '2',
            title: 'Low Stock Alert',
            subtitle: 'iPhone 15 Pro - Only 2 left',
            amount: null,
            color: '#f59e0b',
            icon: '📦',
            type: 'low_stock',
            dueDate: null
          },
          {
            id: '3',
            title: 'GST Filing Due',
            subtitle: 'Monthly GST Return',
            amount: null,
            color: '#8b5cf6',
            icon: '📋',
            type: 'gst_filing',
            dueDate: '2024-02-05'
          }
        ];
      }

      // Get overdue invoices
      const overdueInvoices = await db.getAllAsync(`
        SELECT i.invoice_number, p.name as customer_name, i.balance_amount, i.due_date
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.due_date < date('now') AND i.balance_amount > 0
        ORDER BY i.due_date ASC
        LIMIT 5
      `);

      // Get low stock items
      const lowStockItems = await db.getAllAsync(`
        SELECT name, current_stock, minimum_stock
        FROM items
        WHERE current_stock <= minimum_stock AND is_active = 1
        ORDER BY current_stock ASC
        LIMIT 3
      `);

      const reminders = [];

      // Add overdue payment reminders
      overdueInvoices.forEach((invoice, index) => {
        reminders.push({
          id: `payment_${index}`,
          title: 'Payment Overdue',
          subtitle: `${invoice.customer_name} - ${invoice.invoice_number}`,
          amount: invoice.balance_amount,
          color: '#ef4444',
          icon: '💳',
          type: 'payment_due',
          dueDate: invoice.due_date
        });
      });

      // Add low stock reminders
      lowStockItems.forEach((item, index) => {
        reminders.push({
          id: `stock_${index}`,
          title: 'Low Stock Alert',
          subtitle: `${item.name} - Only ${item.current_stock} left`,
          amount: null,
          color: '#f59e0b',
          icon: '📦',
          type: 'low_stock',
          dueDate: null
        });
      });

      return reminders;
    } catch (error) {
      console.error('❌ Error fetching reminders:', error);
      return [];
    }
  }

  // Get recent transactions
  static async getRecentTransactions() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        // Return mock transactions if database is not available
        return [
          {
            id: '1',
            type: 'Sale',
            customer: 'John Electronics',
            reference: 'INV-001',
            amount: 45000,
            date: '2024-01-25',
            status: 'Paid',
            icon: '💰'
          },
          {
            id: '2',
            type: 'Purchase',
            customer: 'Tech Suppliers',
            reference: 'PUR-015',
            amount: 28000,
            date: '2024-01-24',
            status: 'Pending',
            icon: '📦'
          },
          {
            id: '3',
            type: 'Payment',
            customer: 'ABC Corp',
            reference: 'PAY-008',
            amount: 15000,
            date: '2024-01-23',
            status: 'Received',
            icon: '💳'
          }
        ];
      }

      // Get recent invoices
      const invoices = await db.getAllAsync(`
        SELECT 
          i.id,
          i.invoice_number,
          i.total,
          i.invoice_date,
          i.status,
          p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        ORDER BY i.created_at DESC
        LIMIT 10
      `);

      // Get recent payments
      const payments = await db.getAllAsync(`
        SELECT 
          p.id,
          p.amount,
          p.payment_date,
          p.payment_method,
          pt.name as party_name
        FROM payments p
        LEFT JOIN parties pt ON p.party_id = pt.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `);

      const transactions = [];

      // Add invoices as transactions
      invoices.forEach(invoice => {
        transactions.push({
          id: `inv_${invoice.id}`,
          type: 'Sale',
          customer: invoice.customer_name || 'Unknown Customer',
          reference: invoice.invoice_number,
          amount: invoice.total,
          date: invoice.invoice_date,
          status: invoice.status,
          icon: '💰'
        });
      });

      // Add payments as transactions
      payments.forEach(payment => {
        transactions.push({
          id: `pay_${payment.id}`,
          type: 'Payment',
          customer: payment.party_name || 'Unknown Party',
          reference: `PAY-${payment.id}`,
          amount: payment.amount,
          date: payment.payment_date,
          status: 'Received',
          icon: '💳'
        });
      });

      // Sort by date and return latest
      return transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      return [];
    }
  }

  // Get notifications
  static async getNotifications() {
    try {
      const reminders = await this.getReminders();
      
      // Convert high-priority reminders to notifications
      const notifications = reminders
        .filter(reminder => reminder.type === 'payment_due')
        .slice(0, 3)
        .map(reminder => ({
          id: reminder.id,
          title: reminder.title,
          message: reminder.subtitle,
          type: 'warning',
          timestamp: new Date().toISOString()
        }));

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  // Get sales chart data
  static async getSalesChartData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        // Return mock chart data
        return [
          { day: 'Mon', sales: 12000 },
          { day: 'Tue', sales: 15000 },
          { day: 'Wed', sales: 8000 },
          { day: 'Thu', sales: 22000 },
          { day: 'Fri', sales: 18000 },
          { day: 'Sat', sales: 25000 },
          { day: 'Sun', sales: 14000 }
        ];
      }

      // Get last 7 days sales data
      const salesData = await db.getAllAsync(`
        SELECT 
          DATE(invoice_date) as sale_date,
          SUM(total) as daily_sales
        FROM invoices
        WHERE invoice_date >= date('now', '-7 days')
        AND status != 'cancelled'
        GROUP BY DATE(invoice_date)
        ORDER BY sale_date ASC
      `);

      // Format for chart
      const chartData = salesData.map(item => ({
        day: new Date(item.sale_date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: item.daily_sales || 0
      }));

      return chartData;
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
      return [];
    }
  }

  // Get business profile
  static async getBusinessProfile() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return {
          businessName: "Brojgar Business",
          ownerName: "Business Owner",
          gstNumber: "27XXXXX1234X1Z5",
          phone: "+91 98765 43210",
          email: "business@brojgar.com"
        };
      }

      // Get business settings from database
      const settings = await db.getAllAsync(`
        SELECT key, value FROM settings
        WHERE key IN ('business_name', 'owner_name', 'gst_number', 'phone', 'email')
      `);

      const profile = {
        businessName: "Brojgar Business",
        ownerName: "Business Owner", 
        gstNumber: "27XXXXX1234X1Z5",
        phone: "+91 98765 43210",
        email: "business@brojgar.com"
      };

      // Update with database values
      settings.forEach(setting => {
        switch (setting.key) {
          case 'business_name':
            profile.businessName = setting.value;
            break;
          case 'owner_name':
            profile.ownerName = setting.value;
            break;
          case 'gst_number':
            profile.gstNumber = setting.value;
            break;
          case 'phone':
            profile.phone = setting.value;
            break;
          case 'email':
            profile.email = setting.value;
            break;
        }
      });

      return profile;
    } catch (error) {
      console.error('❌ Error fetching business profile:', error);
      return {
        businessName: "Brojgar Business",
        ownerName: "Business Owner",
        gstNumber: "27XXXXX1234X1Z5",
        phone: "+91 98765 43210",
        email: "business@brojgar.com"
      };
    }
  }

  // Get dashboard summary
  static async getDashboardSummary() {
    try {
      const [kpiData, transactions, reminders] = await Promise.all([
        this.getKPIData(),
        this.getRecentTransactions(),
        this.getReminders()
      ]);

      return {
        totalTransactions: transactions.length,
        pendingReminders: reminders.length,
        netCashFlow: (kpiData.toCollect || 0) - (kpiData.toPay || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error generating dashboard summary:', error);
      return {
        totalTransactions: 0,
        pendingReminders: 0,
        netCashFlow: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Get quick report shortcuts
  static getReportShortcuts() {
    return [
      { id: '1', title: 'Sales Report', icon: '📊', screen: 'Reports', type: 'sales' },
      { id: '2', title: 'Purchase Report', icon: '🛒', screen: 'Reports', type: 'purchase' },
      { id: '3', title: 'Stock Report', icon: '📦', screen: 'Reports', type: 'inventory' },
      { id: '4', title: 'P&L Statement', icon: '💰', screen: 'Reports', type: 'profit_loss' },
      { id: '5', title: 'GST Report', icon: '📋', screen: 'Reports', type: 'gst' },
      { id: '6', title: 'Customer Report', icon: '👥', screen: 'Reports', type: 'customers' }
    ];
  }

  // Get quick actions
  static getQuickActions() {
    return [
      { id: '1', title: 'New Sale', icon: '💰', action: 'newSale', color: '#10b981' },
      { id: '2', title: 'Add Item', icon: '📦', action: 'addItem', color: '#3b82f6' },
      { id: '3', title: 'New Customer', icon: '👤', action: 'newCustomer', color: '#8b5cf6' },
      { id: '4', title: 'Receive Payment', icon: '💳', action: 'receivePayment', color: '#f59e0b' },
      { id: '5', title: 'New Invoice', icon: '🧾', action: 'newInvoice', color: '#ef4444' },
      { id: '6', title: 'View Reports', icon: '📊', action: 'viewReports', color: '#06b6d4' }
    ];
  }
}

export default DashboardService;