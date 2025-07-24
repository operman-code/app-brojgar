// screens/Reports/services/ReportsService.js
import DatabaseService from '../../../database/DatabaseService';

class ReportsService {
  static async getReportsData(period = 'this_month') {
    try {
      await DatabaseService.init();
      
      const dateRange = this.getDateRange(period);
      
      const [overview, topItems, transactions, trends] = await Promise.all([
        this.getOverviewData(dateRange),
        this.getTopSellingItems(dateRange),
        this.getRecentTransactions(dateRange),
        this.getSalesTrends(dateRange)
      ]);
      
      return {
        overview,
        topItems,
        recentTransactions: transactions,
        trends
      };
    } catch (error) {
      console.error('❌ Error fetching reports data:', error);
      return this.getFallbackData();
    }
  }

  static async getOverviewData(dateRange) {
    try {
      const [sales, purchases, profits] = await Promise.all([
        this.getSalesData(dateRange),
        this.getPurchasesData(dateRange),
        this.getProfitData(dateRange)
      ]);
      
      return {
        totalSales: sales.total,
        totalPurchases: purchases.total,
        grossProfit: sales.total - purchases.total,
        netProfit: (sales.total - purchases.total) * 0.8, // Estimate after expenses
        salesCount: sales.count,
        purchaseCount: purchases.count
      };
    } catch (error) {
      console.error('❌ Error getting overview data:', error);
      return {
        totalSales: 0,
        totalPurchases: 0,
        grossProfit: 0,
        netProfit: 0,
        salesCount: 0,
        purchaseCount: 0
      };
    }
  }

  static async getSalesData(dateRange) {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as total
        FROM invoices 
        WHERE DATE(invoice_date) BETWEEN ? AND ? 
          AND deleted_at IS NULL
      `, [dateRange.start, dateRange.end]);
      
      return result[0] || { count: 0, total: 0 };
    } catch (error) {
      console.error('❌ Error getting sales data:', error);
      return { count: 0, total: 0 };
    }
  }

  static async getPurchasesData(dateRange) {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE DATE(expense_date) BETWEEN ? AND ?
      `, [dateRange.start, dateRange.end]);
      
      return result[0] || { count: 0, total: 0 };
    } catch (error) {
      console.error('❌ Error getting purchases data:', error);
      return { count: 0, total: 0 };
    }
  }

  static async getProfitData(dateRange) {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT 
          COALESCE(SUM(ii.total), 0) as revenue,
          COALESCE(SUM(ii.quantity * i.cost_price), 0) as cost
        FROM invoice_items ii
        JOIN items i ON ii.item_id = i.id
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE DATE(inv.invoice_date) BETWEEN ? AND ?
          AND inv.deleted_at IS NULL
      `, [dateRange.start, dateRange.end]);
      
      const data = result[0];
      return {
        revenue: data.revenue || 0,
        cost: data.cost || 0,
        profit: (data.revenue || 0) - (data.cost || 0)
      };
    } catch (error) {
      console.error('❌ Error getting profit data:', error);
      return { revenue: 0, cost: 0, profit: 0 };
    }
  }

  static async getTopSellingItems(dateRange, limit = 5) {
    try {
      const items = await DatabaseService.executeQuery(`
        SELECT 
          i.name,
          COALESCE(SUM(ii.quantity), 0) as total_quantity,
          COALESCE(SUM(ii.total), 0) as total_sales,
          COALESCE(SUM(ii.quantity * i.cost_price), 0) as total_cost
        FROM items i
        JOIN invoice_items ii ON i.id = ii.item_id
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE DATE(inv.invoice_date) BETWEEN ? AND ?
          AND inv.deleted_at IS NULL
        GROUP BY i.id, i.name
        ORDER BY total_sales DESC
        LIMIT ?
      `, [dateRange.start, dateRange.end, limit]);
      
      return items.map(item => ({
        name: item.name,
        sales: item.total_sales,
        quantity: item.total_quantity,
        profit: item.total_sales - item.total_cost
      }));
    } catch (error) {
      console.error('❌ Error getting top selling items:', error);
      return [];
    }
  }

  static async getRecentTransactions(dateRange, limit = 10) {
    try {
      const transactions = await DatabaseService.executeQuery(`
        SELECT 
          i.id,
          i.invoice_number,
          i.total,
          i.invoice_date,
          i.status,
          p.name as party_name,
          'sale' as type
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE DATE(i.invoice_date) BETWEEN ? AND ?
          AND i.deleted_at IS NULL
        ORDER BY i.created_at DESC
        LIMIT ?
      `, [dateRange.start, dateRange.end, limit]);
      
      return transactions.map(t => ({
        id: t.id,
        type: t.type,
        party: t.party_name,
        amount: t.total,
        date: t.invoice_date,
        status: t.status,
        reference: t.invoice_number
      }));
    } catch (error) {
      console.error('❌ Error getting recent transactions:', error);
      return [];
    }
  }

  static async getSalesTrends(dateRange) {
    try {
      const trends = await DatabaseService.executeQuery(`
        SELECT 
          DATE(invoice_date) as date,
          COALESCE(SUM(total), 0) as daily_sales,
          COUNT(*) as daily_count
        FROM invoices 
        WHERE DATE(invoice_date) BETWEEN ? AND ?
          AND deleted_at IS NULL
        GROUP BY DATE(invoice_date)
        ORDER BY date ASC
      `, [dateRange.start, dateRange.end]);
      
      return trends.map(trend => ({
        date: trend.date,
        sales: trend.daily_sales,
        count: trend.daily_count
      }));
    } catch (error) {
      console.error('❌ Error getting sales trends:', error);
      return [];
    }
  }

  static getDateRange(period) {
    const today = new Date();
    let start, end;
    
    switch (period) {
      case 'today':
        start = end = today.toISOString().split('T')[0];
        break;
      case 'this_week':
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        start = startOfWeek.toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      case 'this_year':
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
    }
    
    return { start, end };
  }

  static getFallbackData() {
    return {
      overview: {
        totalSales: 0,
        totalPurchases: 0,
        grossProfit: 0,
        netProfit: 0,
        salesCount: 0,
        purchaseCount: 0
      },
      topItems: [],
      recentTransactions: [],
      trends: []
    };
  }
}

export default ReportsService;
