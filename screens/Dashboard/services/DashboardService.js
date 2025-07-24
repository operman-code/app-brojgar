// screens/Dashboard/services/DashboardService.js
import DatabaseService from '../../../database/DatabaseService';

class DashboardService {
  // Get dashboard overview data
  static async getDashboardData() {
    try {
      await DatabaseService.init();
      
      const [
        todaySales,
        monthSales,
        totalCustomers,
        totalSuppliers,
        lowStockItems,
        recentTransactions,
        pendingPayments,
        topItems
      ] = await Promise.all([
        this.getTodaySales(),
        this.getMonthSales(),
        this.getTotalCustomers(),
        this.getTotalSuppliers(),
        this.getLowStockItems(),
        this.getRecentTransactions(5),
        this.getPendingPayments(),
        this.getTopSellingItems()
      ]);

      return {
        kpis: {
          todaySales: todaySales.total || 0,
          todayCount: todaySales.count || 0,
          monthSales: monthSales.total || 0,
          monthCount: monthSales.count || 0,
          totalCustomers: totalCustomers || 0,
          totalSuppliers: totalSuppliers || 0,
          lowStockCount: lowStockItems.length || 0,
          pendingPayments: pendingPayments.total || 0
        },
        insights: {
          salesGrowth: await this.getSalesGrowth(),
          profitMargin: await this.getProfitMargin(),
          topCustomer: await this.getTopCustomer(),
          inventoryValue: await this.getInventoryValue()
        },
        recentTransactions,
        lowStockItems,
        topItems: topItems.slice(0, 3),
        reminders: await this.getReminders()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return this.getDefaultDashboardData();
    }
  }

  // Get today's sales
  static async getTodaySales() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM invoices 
        WHERE DATE(invoice_date) = ? 
        AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query, [today]);
      return result.rows._array[0] || { count: 0, total: 0 };
    } catch (error) {
      console.error('Error getting today sales:', error);
      return { count: 0, total: 0 };
    }
  }

  // Get this month's sales
  static async getMonthSales() {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const query = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM invoices 
        WHERE DATE(invoice_date) BETWEEN ? AND ?
        AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query, [firstDay, lastDay]);
      return result.rows._array[0] || { count: 0, total: 0 };
    } catch (error) {
      console.error('Error getting month sales:', error);
      return { count: 0, total: 0 };
    }
  }

  // Get total customers
  static async getTotalCustomers() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE type = 'Customer' 
        AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total customers:', error);
      return 0;
    }
  }

  // Get total suppliers
  static async getTotalSuppliers() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE type = 'Supplier' 
        AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total suppliers:', error);
      return 0;
    }
  }

  // Get low stock items
  static async getLowStockItems() {
    try {
      const query = `
        SELECT * FROM inventory_items 
        WHERE current_stock <= min_stock 
        AND (deleted_at IS NULL OR deleted_at = '')
        ORDER BY current_stock ASC
        LIMIT 10
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error getting low stock items:', error);
      return [];
    }
  }

  // Get recent transactions
  static async getRecentTransactions(limit = 5) {
    try {
      const query = `
        SELECT 
          t.*,
          p.name as party_name
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
        ORDER BY t.transaction_date DESC, t.id DESC
        LIMIT ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [limit]);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  // Get pending payments (simplified without paid_amount)
  static async getPendingPayments() {
    try {
      const query = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM invoices 
        WHERE status = 'pending' 
        AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0] || { count: 0, total: 0 };
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return { count: 0, total: 0 };
    }
  }

  // Get top selling items (FIXED - removed ambiguous total column)
  static async getTopSellingItems() {
    try {
      const query = `
        SELECT 
          ii.item_name,
          SUM(ii.quantity) as total_quantity,
          SUM(ii.total) as total_sales
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE (ii.deleted_at IS NULL OR ii.deleted_at = '')
        AND (i.deleted_at IS NULL OR i.deleted_at = '')
        GROUP BY ii.item_name
        ORDER BY total_sales DESC
        LIMIT 5
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  }

  // Get sales growth
  static async getSalesGrowth() {
    try {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      
      const [thisMonthSales, lastMonthSales] = await Promise.all([
        DatabaseService.executeQuery(`
          SELECT COALESCE(SUM(total), 0) as total
          FROM invoices 
          WHERE DATE(invoice_date) >= ?
          AND (deleted_at IS NULL OR deleted_at = '')
        `, [thisMonth]),
        DatabaseService.executeQuery(`
          SELECT COALESCE(SUM(total), 0) as total
          FROM invoices 
          WHERE DATE(invoice_date) BETWEEN ? AND ?
          AND (deleted_at IS NULL OR deleted_at = '')
        `, [lastMonth, lastMonthEnd])
      ]);
      
      const thisTotal = thisMonthSales.rows._array[0]?.total || 0;
      const lastTotal = lastMonthSales.rows._array[0]?.total || 0;
      
      if (lastTotal === 0) return 0;
      return ((thisTotal - lastTotal) / lastTotal * 100).toFixed(1);
    } catch (error) {
      console.error('Error calculating sales growth:', error);
      return 0;
    }
  }

  // Get profit margin
  static async getProfitMargin() {
    try {
      // This is a simplified calculation
      const query = `
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as transactions
        FROM invoices 
        WHERE (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const data = result.rows._array[0];
      
      // Assuming 30% profit margin as default calculation
      return data?.revenue > 0 ? '30.0' : '0.0';
    } catch (error) {
      console.error('Error calculating profit margin:', error);
      return '0.0';
    }
  }

  // Get top customer
  static async getTopCustomer() {
    try {
      const query = `
        SELECT 
          p.name,
          COALESCE(SUM(i.total), 0) as total_sales
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id 
          AND (i.deleted_at IS NULL OR i.deleted_at = '')
        WHERE p.type = 'Customer' 
        AND (p.deleted_at IS NULL OR p.deleted_at = '')
        GROUP BY p.id, p.name
        ORDER BY total_sales DESC
        LIMIT 1
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0]?.name || 'No customers yet';
    } catch (error) {
      console.error('Error getting top customer:', error);
      return 'No customers yet';
    }
  }

  // Get inventory value
  static async getInventoryValue() {
    try {
      const query = `
        SELECT COALESCE(SUM(current_stock * sale_price), 0) as total_value
        FROM inventory_items 
        WHERE (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0]?.total_value || 0;
    } catch (error) {
      console.error('Error getting inventory value:', error);
      return 0;
    }
  }

  // Get reminders
  static async getReminders() {
    try {
      const reminders = [];
      
      // Low stock reminders
      const lowStock = await this.getLowStockItems();
      if (lowStock.length > 0) {
        reminders.push({
          id: 'low_stock',
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${lowStock.length} items are running low on stock`,
          action: 'View Items'
        });
      }
      
      // Pending payments
      const pending = await this.getPendingPayments();
      if (pending.count > 0) {
        reminders.push({
          id: 'pending_payments',
          type: 'info',
          title: 'Pending Payments',
          message: `₹${pending.total.toLocaleString()} pending from ${pending.count} invoices`,
          action: 'View Invoices'
        });
      }
      
      return reminders;
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Get default dashboard data
  static getDefaultDashboardData() {
    return {
      kpis: {
        todaySales: 0,
        todayCount: 0,
        monthSales: 0,
        monthCount: 0,
        totalCustomers: 0,
        totalSuppliers: 0,
        lowStockCount: 0,
        pendingPayments: 0
      },
      insights: {
        salesGrowth: '0.0',
        profitMargin: '0.0',
        topCustomer: 'No customers yet',
        inventoryValue: 0
      },
      recentTransactions: [],
      lowStockItems: [],
      topItems: [],
      reminders: []
    };
  }
}

export default DashboardService;
