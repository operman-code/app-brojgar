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
        toCollectTrend: 0,
        toPayTrend: 0,
        stockTrend: 0,
        salesTrend: 0,
        balanceTrend: 0,
      };
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
      return {
        toCollect: 0,
        toPay: 0,
        stockValue: 0,
        weekSales: 0,
        totalBalance: 0,
        toCollectTrend: 0,
        toPayTrend: 0,
        stockTrend: 0,
        salesTrend: 0,
        balanceTrend: 0,
      };
    }
  }

  // Get sales chart data from database
  static async getSalesChartData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const result = await db.getAllAsync(`
        SELECT 
          CASE CAST(strftime('%w', invoice_date) AS INTEGER)
            WHEN 0 THEN 'Sun'
            WHEN 1 THEN 'Mon'
            WHEN 2 THEN 'Tue'
            WHEN 3 THEN 'Wed'
            WHEN 4 THEN 'Thu'
            WHEN 5 THEN 'Fri'
            WHEN 6 THEN 'Sat'
          END as day,
          COALESCE(SUM(paid_amount), 0) as sales,
          15000 as target
        FROM invoices 
        WHERE invoice_date >= date('now', 'weekday 0', '-6 days')
        AND invoice_date <= date('now')
        AND status != 'cancelled'
        GROUP BY strftime('%w', invoice_date)
        ORDER BY strftime('%w', invoice_date)
      `);
      
      // Ensure all days are present
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map(day => {
        const dayData = result.find(r => r.day === day);
        return {
          day,
          sales: dayData?.sales || 0,
          target: 15000
        };
      });
    } catch (error) {
      console.error('❌ Error fetching sales chart data:', error);
      return [];
    }
  }

  // Get notifications from database
  static async getNotifications() {
    try {
      const db = await DatabaseService.getDatabase();
      const notifications = [];
      
      // Check for overdue invoices
      const overdueInvoices = await db.getAllAsync(`
        SELECT i.invoice_number, p.name as party_name, i.balance_amount,
               julianday('now') - julianday(i.due_date) as days_overdue
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE i.due_date < date('now') 
        AND i.balance_amount > 0 
        AND i.status != 'cancelled'
        ORDER BY days_overdue DESC
        LIMIT 5
      `);
      
      overdueInvoices.forEach(invoice => {
        notifications.push({
          id: `overdue_${invoice.invoice_number}`,
          type: "warning",
          title: "Payment Overdue",
          message: `Invoice ${invoice.invoice_number} from ${invoice.party_name} is ${Math.floor(invoice.days_overdue)} days overdue (${this.formatCurrency(invoice.balance_amount)}).`,
          timestamp: `${Math.floor(invoice.days_overdue)} days ago`,
          priority: "high"
        });
      });
      
      // Check for low stock items
      const lowStockItems = await db.getAllAsync(`
        SELECT name, current_stock, minimum_stock
        FROM items
        WHERE current_stock <= minimum_stock 
        AND is_active = 1
        ORDER BY (current_stock / minimum_stock) ASC
        LIMIT 3
      `);
      
      lowStockItems.forEach(item => {
        notifications.push({
          id: `lowstock_${item.name}`,
          type: "info",
          title: "Low Stock Alert",
          message: `${item.name} is running low (${item.current_stock} remaining, minimum: ${item.minimum_stock}).`,
          timestamp: "Today",
          priority: "medium"
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  // Get recent transactions from database
  static async getRecentTransactions() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const transactions = await db.getAllAsync(`
        SELECT 
          'invoice' as type,
          i.invoice_number as reference,
          p.name as party_name,
          i.total_amount as amount,
          i.invoice_date as date,
          i.status
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE i.invoice_date >= date('now', '-30 days')
        
        UNION ALL
        
        SELECT 
          'payment' as type,
          COALESCE(pay.reference_number, 'PAY-' || pay.id) as reference,
          p.name as party_name,
          pay.amount,
          pay.payment_date as date,
          'completed' as status
        FROM payments pay
        JOIN parties p ON pay.party_id = p.id
        WHERE pay.payment_date >= date('now', '-30 days')
        
        ORDER BY date DESC
        LIMIT 10
      `);
      
      return transactions.map(tx => ({
        id: `${tx.type}_${tx.reference}`,
        type: tx.type,
        reference: tx.reference,
        partyName: tx.party_name,
        amount: tx.amount,
        date: tx.date,
        status: tx.status || 'completed'
      }));
    } catch (error) {
      console.error('❌ Error fetching recent transactions:', error);
      return [];
    }
  }

  // Calculate business metrics from database
  static async calculateBusinessMetrics() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Get total sales this month
      const salesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM invoices
        WHERE strftime('%Y-%m', invoice_date) = strftime('%Y-%m', 'now')
        AND status != 'cancelled'
      `);
      
      // Get total expenses this month
      const expensesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE strftime('%Y-%m', expense_date) = strftime('%Y-%m', 'now')
      `);
      
      // Get total customers
      const customersResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM parties
        WHERE type IN ('customer', 'both') AND is_active = 1
      `);
      
      // Get total items
      const itemsResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM items
        WHERE is_active = 1
      `);
      
      const totalSales = salesResult?.total || 0;
      const totalExpenses = expensesResult?.total || 0;
      
      return {
        totalSales,
        totalExpenses,
        netRevenue: totalSales - totalExpenses,
        totalCustomers: customersResult?.count || 0,
        totalItems: itemsResult?.count || 0,
        averageSaleValue: totalSales > 0 ? totalSales / (customersResult?.count || 1) : 0
      };
    } catch (error) {
      console.error('❌ Error calculating business metrics:', error);
      return {
        totalSales: 0,
        totalExpenses: 0,
        netRevenue: 0,
        totalCustomers: 0,
        totalItems: 0,
        averageSaleValue: 0
      };
    }
  }

  // Get monthly growth data
  static async getMonthlyGrowthData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const growthData = await db.getAllAsync(`
        SELECT 
          strftime('%Y-%m', invoice_date) as month,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM invoices
        WHERE invoice_date >= date('now', '-12 months')
        AND status != 'cancelled'
        GROUP BY strftime('%Y-%m', invoice_date)
        ORDER BY month ASC
      `);
      
      return growthData.map(data => ({
        month: data.month,
        revenue: data.revenue,
        expenses: 0, // Add expense calculation if needed
        profit: data.revenue // Simplified - subtract expenses in real implementation
      }));
    } catch (error) {
      console.error('❌ Error fetching growth data:', error);
      return [];
    }
  }

  // Get dashboard summary (legacy method for compatibility)
  static async getDashboardSummary() {
    try {
      const [kpiData, businessMetrics] = await Promise.all([
        this.getKPIData(),
        this.calculateBusinessMetrics()
      ]);

      return {
        totalRevenue: businessMetrics.totalSales,
        totalExpenses: businessMetrics.totalExpenses,
        netProfit: businessMetrics.netRevenue,
        totalCustomers: businessMetrics.totalCustomers,
        totalProducts: businessMetrics.totalItems,
        pendingPayments: kpiData.toCollect,
        lowStockAlerts: 0, // Will be calculated from notifications
        thisMonthSales: businessMetrics.totalSales,
        lastMonthSales: 0, // Add calculation if needed
        growthPercentage: 0, // Add calculation if needed
      };
    } catch (error) {
      console.error('❌ Error getting dashboard summary:', error);
      return {};
    }
  }

  // Get business profile
  static getBusinessProfile() {
    return {
      businessName: "Brojgar Business",
      ownerName: "Business Owner",
      gstNumber: "07ABCDE1234F1Z5",
      phone: "+91 98765 43210",
      email: "contact@brojgar.com",
      address: "Shop No. 45, Block A, Connaught Place, New Delhi - 110001"
    };
  }

  // Get quick actions
  static getQuickActions() {
    return [
      {
        id: 'new-invoice',
        title: 'New Invoice',
        icon: '📄',
        color: '#3B82F6',
        description: 'Create a new invoice'
      },
      {
        id: 'receive-payment',
        title: 'Receive Payment',
        icon: '💰',
        color: '#10B981',
        description: 'Record a payment received'
      },
      {
        id: 'add-customer',
        title: 'Add Customer',
        icon: '👥',
        color: '#8B5CF6',
        description: 'Add a new customer'
      },
      {
        id: 'add-item',
        title: 'Add Item',
        icon: '📦',
        color: '#F59E0B',
        description: 'Add inventory item'
      },
      {
        id: 'view-reports',
        title: 'View Reports',
        icon: '📊',
        color: '#EF4444',
        description: 'View business reports'
      }
    ];
  }

  // Get report shortcuts
  static getReportShortcuts() {
    return [
      {
        id: 'sales-report',
        title: 'Sales Report',
        icon: '💰',
        color: '#10B981'
      },
      {
        id: 'inventory-report',
        title: 'Inventory Report', 
        icon: '📦',
        color: '#3B82F6'
      },
      {
        id: 'customer-report',
        title: 'Customer Report',
        icon: '👥', 
        color: '#8B5CF6'
      },
      {
        id: 'financial-report',
        title: 'Financial Report',
        icon: '📊',
        color: '#F59E0B'
      }
    ];
  }
}

export default DashboardService;
