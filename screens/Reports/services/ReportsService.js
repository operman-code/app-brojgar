// screens/Reports/services/ReportsService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class ReportsService {
  // Get comprehensive reports data for the main reports screen
  static async getReportsData() {
    try {
      const [
        overview,
        salesData,
        purchaseData,
        customerData,
        inventoryData,
        profitLossData,
        taxData
      ] = await Promise.all([
        this.getOverviewData(),
        this.getSalesData(),
        this.getPurchaseData(),
        this.getCustomerData(),
        this.getInventoryData(),
        this.getProfitLossData(),
        this.getTaxData()
      ]);

      return {
        overview,
        salesData,
        purchaseData,
        customerData,
        inventoryData,
        profitLossData,
        taxData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting reports data:', error);
      return {
        overview: {},
        salesData: [],
        purchaseData: [],
        customerData: [],
        inventoryData: [],
        profitLossData: {},
        taxData: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Get overview data for reports dashboard
  static async getOverviewData() {
    try {
      const [
        totalSales,
        totalExpenses,
        totalCustomers,
        totalSuppliers,
        totalInvoices,
        totalItems,
        pendingPayments,
        lowStockItems
      ] = await Promise.all([
        this.getTotalSales(),
        this.getTotalExpenses(),
        this.getTotalCustomers(),
        this.getTotalSuppliers(),
        this.getTotalInvoices(),
        this.getTotalItems(),
        this.getPendingPayments(),
        this.getLowStockCount()
      ]);

      return {
        totalSales,
        totalExpenses,
        netProfit: totalSales - totalExpenses,
        totalCustomers,
        totalSuppliers,
        totalInvoices,
        totalItems,
        pendingPayments,
        lowStockItems
      };
    } catch (error) {
      console.error('❌ Error getting overview data:', error);
      return {};
    }
  }

  // Sales Report Data
  static async getSalesData(startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const params = [];

      if (startDate && endDate) {
        dateFilter = 'AND i.date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        // Default to current month
        dateFilter = "AND strftime('%Y-%m', i.date) = strftime('%Y-%m', 'now')";
      }

      const query = `
        SELECT 
          i.invoice_number,
          i.date,
          i.total,
          i.tax_amount,
          i.status,
          p.name as customer_name,
          COUNT(ii.id) as items_count
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        WHERE i.deleted_at IS NULL ${dateFilter}
        GROUP BY i.id
        ORDER BY i.date DESC
      `;

      return await DatabaseService.executeQuery(query, params);
    } catch (error) {
      console.error('❌ Error getting sales data:', error);
      return [];
    }
  }

  // Purchase Report Data
  static async getPurchaseData(startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const params = [];

      if (startDate && endDate) {
        dateFilter = 'AND t.date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        dateFilter = "AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')";
      }

      const query = `
        SELECT 
          t.reference,
          t.date,
          t.amount,
          t.type,
          t.status,
          p.name as supplier_name,
          t.description
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE t.deleted_at IS NULL 
          AND t.type = 'expense' 
          ${dateFilter}
        ORDER BY t.date DESC
      `;

      return await DatabaseService.executeQuery(query, params);
    } catch (error) {
      console.error('❌ Error getting purchase data:', error);
      return [];
    }
  }

  // Customer Report Data
  static async getCustomerData() {
    try {
      const query = `
        SELECT 
          p.name,
          p.phone,
          p.email,
          p.type,
          COUNT(i.id) as total_invoices,
          COALESCE(SUM(i.total), 0) as total_purchases,
          COALESCE(SUM(i.total - COALESCE(i.paid_amount, 0)), 0) as outstanding_amount,
          MAX(i.date) as last_transaction_date
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.deleted_at IS NULL
        WHERE p.deleted_at IS NULL 
          AND (p.type = 'customer' OR p.type = 'both')
        GROUP BY p.id
        ORDER BY total_purchases DESC
      `;

      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting customer data:', error);
      return [];
    }
  }

  // Inventory Report Data
  static async getInventoryData() {
    try {
      const query = `
        SELECT 
          item_name,
          item_code,
          category,
          stock_quantity,
          min_stock_level,
          cost_price,
          selling_price,
          (stock_quantity * cost_price) as stock_value,
          (stock_quantity * selling_price) as retail_value,
          CASE 
            WHEN stock_quantity <= 0 THEN 'Out of Stock'
            WHEN stock_quantity <= min_stock_level THEN 'Low Stock'
            ELSE 'In Stock'
          END as status
        FROM inventory_items
        WHERE deleted_at IS NULL
        ORDER BY item_name ASC
      `;

      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting inventory data:', error);
      return [];
    }
  }

  // Profit & Loss Data
  static async getProfitLossData(startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const params = [];

      if (startDate && endDate) {
        dateFilter = 'WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        dateFilter = "WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')";
      }

      // Total Sales
      const salesQuery = `
        SELECT COALESCE(SUM(total), 0) as total_sales
        FROM invoices 
        ${dateFilter.replace('date', 'invoices.date')} 
          AND deleted_at IS NULL
      `;

      // Total Expenses
      const expensesQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_expenses
        FROM transactions 
        ${dateFilter.replace('date', 'transactions.date')} 
          AND deleted_at IS NULL 
          AND type = 'expense'
      `;

      // Cost of Goods Sold
      const cogsQuery = `
        SELECT COALESCE(SUM(ii.quantity * inv.cost_price), 0) as cogs
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        JOIN inventory_items inv ON ii.item_id = inv.id
        ${dateFilter.replace('date', 'i.date')} 
          AND i.deleted_at IS NULL 
          AND ii.deleted_at IS NULL
      `;

      const [salesResult, expensesResult, cogsResult] = await Promise.all([
        DatabaseService.executeQuery(salesQuery, params),
        DatabaseService.executeQuery(expensesQuery, params),
        DatabaseService.executeQuery(cogsQuery, params)
      ]);

      const totalSales = salesResult[0]?.total_sales || 0;
      const totalExpenses = expensesResult[0]?.total_expenses || 0;
      const cogs = cogsResult[0]?.cogs || 0;

      const grossProfit = totalSales - cogs;
      const netProfit = grossProfit - totalExpenses;

      return {
        totalSales,
        cogs,
        grossProfit,
        totalExpenses,
        netProfit,
        grossProfitMargin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
        netProfitMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error getting profit loss data:', error);
      return {};
    }
  }

  // Tax Report Data
  static async getTaxData(startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      const params = [];

      if (startDate && endDate) {
        dateFilter = 'AND i.date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else {
        dateFilter = "AND strftime('%Y-%m', i.date) = strftime('%Y-%m', 'now')";
      }

      const query = `
        SELECT 
          i.invoice_number,
          i.date,
          i.subtotal,
          i.tax_amount,
          i.total,
          p.name as customer_name,
          p.gst_number as customer_gst
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL 
          AND i.tax_amount > 0
          ${dateFilter}
        ORDER BY i.date DESC
      `;

      const taxDetails = await DatabaseService.executeQuery(query, params);

      // Calculate totals
      const totalTaxableAmount = taxDetails.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      const totalTaxAmount = taxDetails.reduce((sum, item) => sum + (item.tax_amount || 0), 0);

      return {
        taxDetails,
        totalTaxableAmount,
        totalTaxAmount,
        averageTaxRate: totalTaxableAmount > 0 ? (totalTaxAmount / totalTaxableAmount) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error getting tax data:', error);
      return {};
    }
  }

  // Helper methods for overview data
  static async getTotalSales(period = 'month') {
    try {
      let dateFilter = '';
      
      switch (period) {
        case 'today':
          dateFilter = "AND date = date('now')";
          break;
        case 'week':
          dateFilter = "AND date >= date('now', '-7 days')";
          break;
        case 'month':
          dateFilter = "AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')";
          break;
        case 'year':
          dateFilter = "AND strftime('%Y', date) = strftime('%Y', 'now')";
          break;
      }

      const query = `
        SELECT COALESCE(SUM(total), 0) as total_sales
        FROM invoices 
        WHERE deleted_at IS NULL ${dateFilter}
      `;

      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total_sales || 0;
    } catch (error) {
      console.error('❌ Error getting total sales:', error);
      return 0;
    }
  }

  static async getTotalExpenses(period = 'month') {
    try {
      let dateFilter = '';
      
      switch (period) {
        case 'today':
          dateFilter = "AND date = date('now')";
          break;
        case 'week':
          dateFilter = "AND date >= date('now', '-7 days')";
          break;
        case 'month':
          dateFilter = "AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')";
          break;
        case 'year':
          dateFilter = "AND strftime('%Y', date) = strftime('%Y', 'now')";
          break;
      }

      const query = `
        SELECT COALESCE(SUM(amount), 0) as total_expenses
        FROM transactions 
        WHERE deleted_at IS NULL 
          AND type = 'expense' 
          ${dateFilter}
      `;

      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total_expenses || 0;
    } catch (error) {
      console.error('❌ Error getting total expenses:', error);
      return 0;
    }
  }

  static async getTotalCustomers() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'customer' OR type = 'both')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total customers:', error);
      return 0;
    }
  }

  static async getTotalSuppliers() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'supplier' OR type = 'both')
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total suppliers:', error);
      return 0;
    }
  }

  static async getTotalInvoices() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM invoices 
        WHERE deleted_at IS NULL
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total invoices:', error);
      return 0;
    }
  }

  static async getTotalItems() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total items:', error);
      return 0;
    }
  }

  static async getPendingPayments() {
    try {
      const query = `
        SELECT COALESCE(SUM(total - COALESCE(paid_amount, 0)), 0) as pending_amount
        FROM invoices 
        WHERE deleted_at IS NULL 
          AND total > COALESCE(paid_amount, 0)
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.pending_amount || 0;
    } catch (error) {
      console.error('❌ Error getting pending payments:', error);
      return 0;
    }
  }

  static async getLowStockCount() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND stock_quantity <= min_stock_level
      `;
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting low stock count:', error);
      return 0;
    }
  }

  // Export functionality
  static async exportReport(reportType, data, format = 'csv') {
    try {
      let content = '';
      let filename = '';

      switch (format) {
        case 'csv':
          content = this.convertToCSV(reportType, data);
          filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          throw new Error('Unsupported format');
      }

      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return { success: true, fileUri };
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      return { success: false, error: error.message };
    }
  }

  // Convert data to CSV format
  static convertToCSV(reportType, data) {
    if (!Array.isArray(data) || data.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  // Date range utilities
  static getDateRange(period) {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'last_week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        startDate = lastWeekStart.toISOString().split('T')[0];
        endDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'last_month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'this_year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate = today.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  }

  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Format date
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
  }

  // Get chart data for various metrics
  static async getChartData(metric, period = '7days') {
    try {
      let dateFilter = '';
      let groupBy = '';

      switch (period) {
        case '7days':
          dateFilter = "date >= date('now', '-7 days')";
          groupBy = "DATE(date)";
          break;
        case '30days':
          dateFilter = "date >= date('now', '-30 days')";
          groupBy = "DATE(date)";
          break;
        case '12months':
          dateFilter = "date >= date('now', '-12 months')";
          groupBy = "strftime('%Y-%m', date)";
          break;
      }

      let query = '';
      switch (metric) {
        case 'sales':
          query = `
            SELECT 
              ${groupBy} as period,
              COALESCE(SUM(total), 0) as value
            FROM invoices 
            WHERE deleted_at IS NULL AND ${dateFilter}
            GROUP BY ${groupBy}
            ORDER BY period ASC
          `;
          break;
        case 'expenses':
          query = `
            SELECT 
              ${groupBy} as period,
              COALESCE(SUM(amount), 0) as value
            FROM transactions 
            WHERE deleted_at IS NULL AND type = 'expense' AND ${dateFilter}
            GROUP BY ${groupBy}
            ORDER BY period ASC
          `;
          break;
      }

      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting chart data:', error);
      return [];
    }
  }
}

export default ReportsService;
