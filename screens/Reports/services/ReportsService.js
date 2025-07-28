// screens/Reports/services/ReportsService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class ReportsService {
  // Get comprehensive reports data for the main reports screen
  static async getReportsData(period = 'this_month') {
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
        this.getOverviewData(period),
        this.getSalesData(period),
        this.getPurchaseData(period),
        this.getCustomerData(period),
        this.getInventoryData(),
        this.getProfitLossData(period),
        this.getTaxData(period)
      ]);

      // Add chart data to sales
      const chartData = await this.getSalesChartData(period);
      salesData.chartLabels = chartData.chartLabels;
      salesData.chartValues = chartData.chartValues;

      // Add top categories to inventory
      const topCategories = await this.getTopCategoriesChart();
      inventoryData.topCategories = topCategories;

      return {
        overview,
        salesData,
        purchaseData,
        customerData,
        inventoryData,
        profitLossData,
        taxData
      };
    } catch (error) {
      console.error('❌ Error getting reports data:', error);
      return {
        overview: {},
        salesData: {},
        purchaseData: {},
        customerData: {},
        inventoryData: {},
        profitLossData: {},
        taxData: {}
      };
    }
  }

  // Get overview data
  static async getOverviewData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const [revenue, expenses, transactions] = await Promise.all([
        this.getTotalRevenue(dateRange),
        this.getTotalExpenses(dateRange),
        this.getTotalTransactions(dateRange)
      ]);

      const netProfit = revenue - expenses;

      return {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: netProfit,
        totalTransactions: transactions,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('❌ Error getting overview data:', error);
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalTransactions: 0,
        profitMargin: 0
      };
    }
  }

  // Get sales data
  static async getSalesData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const salesQuery = `
        SELECT 
          COUNT(*) as totalOrders,
          SUM(total) as totalSales,
          AVG(total) as averageOrderValue
        FROM invoices 
        WHERE date >= ? AND date <= ?
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(salesQuery, [dateRange.startDate, dateRange.endDate]);
      const salesData = result?.[0] || {};

      return {
        totalSales: salesData.totalSales || 0,
        totalOrders: salesData.totalOrders || 0,
        averageOrderValue: salesData.averageOrderValue || 0,
        growth: 12.5 // Calculate actual growth compared to previous period
      };
    } catch (error) {
      console.error('❌ Error getting sales data:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        growth: 0
      };
    }
  }

  // Get purchase data
  static async getPurchaseData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const purchaseQuery = `
        SELECT 
          COUNT(*) as totalPurchases,
          SUM(amount) as totalAmount
        FROM transactions 
        WHERE date >= ? AND date <= ?
          AND type = 'expense'
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(purchaseQuery, [dateRange.startDate, dateRange.endDate]);
      const purchaseData = result?.[0] || {};

      return {
        totalPurchases: purchaseData.totalPurchases || 0,
        totalAmount: purchaseData.totalAmount || 0
      };
    } catch (error) {
      console.error('❌ Error getting purchase data:', error);
      return {
        totalPurchases: 0,
        totalAmount: 0
      };
    }
  }

  // Get customer data
  static async getCustomerData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const customerQuery = `
        SELECT COUNT(DISTINCT p.id) as totalCustomers
        FROM parties p
        WHERE p.type = 'customer'
          AND p.deleted_at IS NULL
      `;
      
      const newCustomerQuery = `
        SELECT COUNT(*) as newCustomers
        FROM parties p
        WHERE p.type = 'customer'
          AND p.created_at >= ? AND p.created_at <= ?
          AND p.deleted_at IS NULL
      `;

      const topCustomersQuery = `
        SELECT 
          p.name,
          COUNT(i.id) as totalOrders,
          SUM(i.total) as totalValue
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id
        WHERE p.type = 'customer'
          AND p.deleted_at IS NULL
          AND (i.deleted_at IS NULL OR i.id IS NULL)
        GROUP BY p.id, p.name
        ORDER BY totalValue DESC
        LIMIT 5
      `;
      
      const [totalResult, newResult, topCustomers] = await Promise.all([
        DatabaseService.executeQuery(customerQuery),
        DatabaseService.executeQuery(newCustomerQuery, [dateRange.startDate, dateRange.endDate]),
        DatabaseService.executeQuery(topCustomersQuery)
      ]);

      const totalCustomers = totalResult?.[0]?.totalCustomers || 0;
      const totalValue = topCustomers?.reduce((sum, customer) => sum + (customer.totalValue || 0), 0) || 0;

      return {
        totalCustomers: totalCustomers,
        newCustomers: newResult?.[0]?.newCustomers || 0,
        averageCustomerValue: totalCustomers > 0 ? totalValue / totalCustomers : 0,
        topCustomers: topCustomers?.map(customer => ({
          name: customer.name || 'Unknown',
          totalOrders: customer.totalOrders || 0,
          totalValue: customer.totalValue || 0
        })) || []
      };
    } catch (error) {
      console.error('❌ Error getting customer data:', error);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        averageCustomerValue: 0,
        topCustomers: []
      };
    }
  }

  // Get inventory data
  static async getInventoryData() {
    try {
      const inventoryQuery = `
        SELECT 
          COUNT(*) as totalItems,
          SUM(stock_quantity * cost_price) as totalValue,
          COUNT(CASE WHEN stock_quantity <= min_stock_level THEN 1 END) as lowStockItems
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(inventoryQuery);
      const inventoryData = result?.[0] || {};

      return {
        totalItems: inventoryData.totalItems || 0,
        totalValue: inventoryData.totalValue || 0,
        lowStockItems: inventoryData.lowStockItems || 0
      };
    } catch (error) {
      console.error('❌ Error getting inventory data:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0
      };
    }
  }

  // Get profit and loss data
  static async getProfitLossData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const revenue = await this.getTotalRevenue(dateRange);
      const expenses = await this.getTotalExpenses(dateRange);
      const grossProfit = revenue - expenses;
      
      return {
        revenue: revenue,
        expenses: expenses,
        grossProfit: grossProfit,
        netProfit: grossProfit, // Simplified for now
        profitMargin: revenue > 0 ? ((grossProfit / revenue) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting profit/loss data:', error);
      return {
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0
      };
    }
  }

  // Get tax data
  static async getTaxData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const taxQuery = `
        SELECT 
          SUM(tax_amount) as totalTax,
          SUM(total - tax_amount) as taxableAmount
        FROM invoices 
        WHERE date >= ? AND date <= ?
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(taxQuery, [dateRange.startDate, dateRange.endDate]);
      const taxData = result?.[0] || {};

      return {
        totalTax: taxData.totalTax || 0,
        taxableAmount: taxData.taxableAmount || 0,
        taxRate: taxData.taxableAmount > 0 ? ((taxData.totalTax / taxData.taxableAmount) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting tax data:', error);
      return {
        totalTax: 0,
        taxableAmount: 0,
        taxRate: 0
      };
    }
  }

  // NEW CHART METHODS - ADD THESE:

  // Get chart-specific data for sales
  static async getSalesChartData(period = 'this_month') {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      const query = `
        SELECT 
          DATE(i.date) as date,
          SUM(i.total) as sales
        FROM invoices i
        WHERE i.date >= ? AND i.date <= ?
          AND i.deleted_at IS NULL
        GROUP BY DATE(i.date)
        ORDER BY DATE(i.date)
      `;
      
      const result = await DatabaseService.executeQuery(query, [dateRange.startDate, dateRange.endDate]);
      
      // Process data for chart
      const chartLabels = [];
      const chartValues = [];
      
      if (result && result.length > 0) {
        result.forEach(row => {
          const date = new Date(row.date);
          chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          chartValues.push(row.sales || 0);
        });
      }
      
      return {
        chartLabels: chartLabels.length > 0 ? chartLabels : ["No Data"],
        chartValues: chartValues.length > 0 ? chartValues : [0]
      };
    } catch (error) {
      console.error('❌ Error getting sales chart data:', error);
      return {
        chartLabels: ["No Data"],
        chartValues: [0]
      };
    }
  }

  // Get top categories for pie chart
  static async getTopCategoriesChart() {
    try {
      const query = `
        SELECT 
          c.name,
          COUNT(ii.id) as count,
          SUM(ii.stock_quantity * ii.selling_price) as value
        FROM categories c
        LEFT JOIN inventory_items ii ON c.name = ii.category
        WHERE c.deleted_at IS NULL
          AND (ii.deleted_at IS NULL OR ii.id IS NULL)
        GROUP BY c.name
        ORDER BY value DESC
        LIMIT 5
      `;
      
      const result = await DatabaseService.executeQuery(query);
      
      return result?.map(row => ({
        name: row.name || 'Unknown',
        value: row.value || 0,
        count: row.count || 0
      })) || [];
    } catch (error) {
      console.error('❌ Error getting top categories:', error);
      return [];
    }
  }

  // Helper methods
  static async getTotalRevenue(dateRange) {
    try {
      const query = `
        SELECT SUM(total) as revenue
        FROM invoices 
        WHERE date >= ? AND date <= ?
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [dateRange.startDate, dateRange.endDate]);
      return result?.[0]?.revenue || 0;
    } catch (error) {
      console.error('❌ Error getting total revenue:', error);
      return 0;
    }
  }

  static async getTotalExpenses(dateRange) {
    try {
      const query = `
        SELECT SUM(amount) as expenses
        FROM transactions 
        WHERE date >= ? AND date <= ?
          AND type = 'expense'
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [dateRange.startDate, dateRange.endDate]);
      return result?.[0]?.expenses || 0;
    } catch (error) {
      console.error('❌ Error getting total expenses:', error);
      return 0;
    }
  }

  static async getTotalTransactions(dateRange) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM transactions 
        WHERE date >= ? AND date <= ?
          AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [dateRange.startDate, dateRange.endDate]);
      return result?.[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total transactions:', error);
      return 0;
    }
  }

  static getDateRangeForPeriod(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'this_week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        break;
      case 'this_month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  // Export report functionality
  static async exportReport(reportType, data, format = 'pdf') {
    try {
      if (format === 'csv') {
        return await this.exportToCSV(reportType, data);
      } else {
        return await this.exportToPDF(reportType, data);
      }
    } catch (error) {
      console.error('❌ Error exporting report:', error);
      throw error;
    }
  }

  static async exportToCSV(reportType, data) {
    try {
      let csvContent = '';
      
      // Generate CSV based on report type
      if (reportType === 'sales') {
        csvContent = 'Date,Sales Amount,Orders\n';
        // Add actual data conversion logic here
      }
      
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      await Sharing.shareAsync(fileUri);
      return { success: true, file: fileUri };
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      throw error;
    }
  }

  static async exportToPDF(reportType, data) {
    try {
      // PDF export logic would go here
      // This is a placeholder - you'd need expo-print for actual PDF generation
      console.log('PDF export not implemented yet');
      return { success: false, message: 'PDF export not implemented' };
    } catch (error) {
      console.error('❌ Error exporting to PDF:', error);
      throw error;
    }
  }
}

export default ReportsService;
