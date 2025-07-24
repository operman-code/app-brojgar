// screens/Reports/services/ReportsService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class ReportsService {
  static async getOverviewData(period = 'this_month') {
    try {
      await DatabaseService.init();
      
      const dateRange = this.getDateRange(period);
      
      const [
        salesData,
        purchaseData,
        customerData,
        inventoryData,
        profitData
      ] = await Promise.all([
        this.getSalesData(dateRange),
        this.getPurchaseData(dateRange),
        this.getCustomerData(dateRange),
        this.getInventoryData(),
        this.getProfitLossData(dateRange)
      ]);
      
      return {
        sales: salesData,
        purchases: purchaseData,
        customers: customerData,
        inventory: inventoryData,
        profit: profitData,
        period: period
      };
    } catch (error) {
      console.error('Error getting overview data:', error);
      return this.getDefaultOverviewData();
    }
  }

  static async getSalesData(dateRange) {
    try {
      const { startDate, endDate } = dateRange;
      
      // Total sales for period
      const totalSalesQuery = `
        SELECT 
          COUNT(*) as total_invoices,
          COALESCE(SUM(total), 0) as total_amount,
          COALESCE(AVG(total), 0) as average_amount
        FROM invoices 
        WHERE invoice_date BETWEEN ? AND ? 
        AND deleted_at IS NULL
      `;
      
      const totalResult = await DatabaseService.executeQuery(totalSalesQuery, [startDate, endDate]);
      const totals = totalResult.rows._array[0];
      
      // Daily sales trend
      const dailySalesQuery = `
        SELECT 
          DATE(invoice_date) as date,
          COUNT(*) as invoice_count,
          COALESCE(SUM(total), 0) as amount
        FROM invoices 
        WHERE invoice_date BETWEEN ? AND ? 
        AND deleted_at IS NULL
        GROUP BY DATE(invoice_date)
        ORDER BY date
      `;
      
      const dailyResult = await DatabaseService.executeQuery(dailySalesQuery, [startDate, endDate]);
      const dailyTrend = dailyResult.rows._array;
      
      // Top selling items
      const topItemsQuery = `
        SELECT 
          ii.item_name,
          SUM(ii.quantity) as total_quantity,
          SUM(ii.quantity * ii.unit_price) as total_amount
        FROM invoice_items ii
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.invoice_date BETWEEN ? AND ? 
        AND i.deleted_at IS NULL
        GROUP BY ii.item_name
        ORDER BY total_amount DESC
        LIMIT 10
      `;
      
      const topItemsResult = await DatabaseService.executeQuery(topItemsQuery, [startDate, endDate]);
      const topItems = topItemsResult.rows._array;
      
      return {
        totalInvoices: totals.total_invoices,
        totalAmount: totals.total_amount,
        averageAmount: totals.average_amount,
        dailyTrend,
        topItems
      };
    } catch (error) {
      console.error('Error getting sales data:', error);
      return {
        totalInvoices: 0,
        totalAmount: 0,
        averageAmount: 0,
        dailyTrend: [],
        topItems: []
      };
    }
  }

  static async getPurchaseData(dateRange) {
    try {
      const { startDate, endDate } = dateRange;
      
      const query = `
        SELECT 
          COUNT(*) as total_purchases,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount
        FROM transactions 
        WHERE type = 'purchase' 
        AND transaction_date BETWEEN ? AND ?
        AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [startDate, endDate]);
      const data = result.rows._array[0];
      
      // Daily purchase trend
      const dailyQuery = `
        SELECT 
          DATE(transaction_date) as date,
          COUNT(*) as purchase_count,
          COALESCE(SUM(amount), 0) as amount
        FROM transactions 
        WHERE type = 'purchase'
        AND transaction_date BETWEEN ? AND ?
        AND deleted_at IS NULL
        GROUP BY DATE(transaction_date)
        ORDER BY date
      `;
      
      const dailyResult = await DatabaseService.executeQuery(dailyQuery, [startDate, endDate]);
      
      return {
        totalPurchases: data.total_purchases,
        totalAmount: data.total_amount,
        averageAmount: data.average_amount,
        dailyTrend: dailyResult.rows._array
      };
    } catch (error) {
      console.error('Error getting purchase data:', error);
      return {
        totalPurchases: 0,
        totalAmount: 0,
        averageAmount: 0,
        dailyTrend: []
      };
    }
  }

  static async getCustomerData(dateRange) {
    try {
      const { startDate, endDate } = dateRange;
      
      // Total customers and suppliers
      const totalQuery = `
        SELECT 
          type,
          COUNT(*) as count
        FROM parties 
        WHERE deleted_at IS NULL
        GROUP BY type
      `;
      
      const totalResult = await DatabaseService.executeQuery(totalQuery);
      const totals = totalResult.rows._array;
      
      // Top customers by sales
      const topCustomersQuery = `
        SELECT 
          p.name,
          p.phone,
          COUNT(i.id) as invoice_count,
          COALESCE(SUM(i.total), 0) as total_sales
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id 
          AND i.invoice_date BETWEEN ? AND ?
          AND i.deleted_at IS NULL
        WHERE p.type = 'Customer' AND p.deleted_at IS NULL
        GROUP BY p.id, p.name, p.phone
        ORDER BY total_sales DESC
        LIMIT 10
      `;
      
      const topCustomersResult = await DatabaseService.executeQuery(topCustomersQuery, [startDate, endDate]);
      
      // Customer balances
      const balanceQuery = `
        SELECT 
          p.name,
          COALESCE(SUM(CASE WHEN t.type = 'sale' THEN t.amount ELSE -t.amount END), 0) as balance
        FROM parties p
        LEFT JOIN transactions t ON p.id = t.party_id AND t.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, p.name
        HAVING balance != 0
        ORDER BY ABS(balance) DESC
        LIMIT 10
      `;
      
      const balanceResult = await DatabaseService.executeQuery(balanceQuery);
      
      return {
        totalCustomers: totals.find(t => t.type === 'Customer')?.count || 0,
        totalSuppliers: totals.find(t => t.type === 'Supplier')?.count || 0,
        topCustomers: topCustomersResult.rows._array,
        customerBalances: balanceResult.rows._array
      };
    } catch (error) {
      console.error('Error getting customer data:', error);
      return {
        totalCustomers: 0,
        totalSuppliers: 0,
        topCustomers: [],
        customerBalances: []
      };
    }
  }

  static async getInventoryData() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_items,
          COALESCE(SUM(current_stock * sale_price), 0) as total_value,
          COUNT(CASE WHEN current_stock <= min_stock THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const data = result.rows._array[0];
      
      // Category-wise stock
      const categoryQuery = `
        SELECT 
          c.name as category_name,
          COUNT(i.id) as item_count,
          COALESCE(SUM(i.current_stock * i.sale_price), 0) as category_value
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.deleted_at IS NULL
        GROUP BY c.id, c.name
        ORDER BY category_value DESC
      `;
      
      const categoryResult = await DatabaseService.executeQuery(categoryQuery);
      
      return {
        totalItems: data.total_items,
        totalValue: data.total_value,
        lowStockItems: data.low_stock_items,
        outOfStockItems: data.out_of_stock_items,
        categoryBreakdown: categoryResult.rows._array
      };
    } catch (error) {
      console.error('Error getting inventory data:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        categoryBreakdown: []
      };
    }
  }

  static async getProfitLossData(dateRange) {
    try {
      const { startDate, endDate } = dateRange;
      
      // Income (Sales)
      const incomeQuery = `
        SELECT COALESCE(SUM(total), 0) as total_income
        FROM invoices 
        WHERE invoice_date BETWEEN ? AND ? 
        AND deleted_at IS NULL
      `;
      
      const incomeResult = await DatabaseService.executeQuery(incomeQuery, [startDate, endDate]);
      const totalIncome = incomeResult.rows._array[0].total_income;
      
      // Expenses (Purchases)
      const expenseQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_expenses
        FROM transactions 
        WHERE type = 'purchase' 
        AND transaction_date BETWEEN ? AND ?
        AND deleted_at IS NULL
      `;
      
      const expenseResult = await DatabaseService.executeQuery(expenseQuery, [startDate, endDate]);
      const totalExpenses = expenseResult.rows._array[0].total_expenses;
      
      const grossProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0;
      
      return {
        totalIncome,
        totalExpenses,
        grossProfit,
        profitMargin
      };
    } catch (error) {
      console.error('Error getting profit/loss data:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        grossProfit: 0,
        profitMargin: 0
      };
    }
  }

  static async getTaxData(period = 'this_month') {
    try {
      await DatabaseService.init();
      const dateRange = this.getDateRange(period);
      const { startDate, endDate } = dateRange;
      
      // GST collected (on sales)
      const gstCollectedQuery = `
        SELECT 
          COALESCE(SUM(tax_amount), 0) as gst_collected,
          COUNT(*) as sales_count
        FROM invoices 
        WHERE invoice_date BETWEEN ? AND ? 
        AND deleted_at IS NULL
      `;
      
      const collectedResult = await DatabaseService.executeQuery(gstCollectedQuery, [startDate, endDate]);
      const gstCollected = collectedResult.rows._array[0];
      
      // GST paid (on purchases) - assuming purchases also have tax
      const gstPaidQuery = `
        SELECT 
          COALESCE(SUM(amount * 0.18), 0) as gst_paid,
          COUNT(*) as purchase_count
        FROM transactions 
        WHERE type = 'purchase' 
        AND transaction_date BETWEEN ? AND ?
        AND deleted_at IS NULL
      `;
      
      const paidResult = await DatabaseService.executeQuery(gstPaidQuery, [startDate, endDate]);
      const gstPaid = paidResult.rows._array[0];
      
      const netGST = gstCollected.gst_collected - gstPaid.gst_paid;
      
      return {
        gstCollected: gstCollected.gst_collected,
        gstPaid: gstPaid.gst_paid,
        netGST,
        salesCount: gstCollected.sales_count,
        purchaseCount: gstPaid.purchase_count,
        period
      };
    } catch (error) {
      console.error('Error getting tax data:', error);
      return {
        gstCollected: 0,
        gstPaid: 0,
        netGST: 0,
        salesCount: 0,
        purchaseCount: 0,
        period
      };
    }
  }

  static async exportReport(reportType, period, format = 'pdf') {
    try {
      let reportData;
      let fileName;
      
      switch (reportType) {
        case 'sales':
          reportData = await this.getSalesData(this.getDateRange(period));
          fileName = `Sales_Report_${period}`;
          break;
        case 'purchase':
          reportData = await this.getPurchaseData(this.getDateRange(period));
          fileName = `Purchase_Report_${period}`;
          break;
        case 'inventory':
          reportData = await this.getInventoryData();
          fileName = `Inventory_Report_${period}`;
          break;
        case 'tax':
          reportData = await this.getTaxData(period);
          fileName = `Tax_Report_${period}`;
          break;
        case 'overview':
          reportData = await this.getOverviewData(period);
          fileName = `Overview_Report_${period}`;
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      let exportContent;
      let mimeType;
      
      if (format === 'csv') {
        exportContent = this.convertToCSV(reportData, reportType);
        fileName += '.csv';
        mimeType = 'text/csv';
      } else if (format === 'json') {
        exportContent = JSON.stringify(reportData, null, 2);
        fileName += '.json';
        mimeType = 'application/json';
      } else {
        // Default to PDF-like text format
        exportContent = this.convertToPDFText(reportData, reportType, period);
        fileName += '.txt';
        mimeType = 'text/plain';
      }
      
      // Write to file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, exportContent);
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export ${reportType} Report`
        });
      }
      
      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, error: error.message };
    }
  }

  static convertToCSV(data, reportType) {
    let csv = `${reportType.toUpperCase()} REPORT\n`;
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    if (reportType === 'sales' && data.topItems) {
      csv += 'TOP SELLING ITEMS\n';
      csv += 'Item Name,Quantity Sold,Total Amount\n';
      data.topItems.forEach(item => {
        csv += `${item.item_name},${item.total_quantity},${item.total_amount}\n`;
      });
      csv += '\n';
    }
    
    if (reportType === 'inventory' && data.categoryBreakdown) {
      csv += 'CATEGORY BREAKDOWN\n';
      csv += 'Category,Item Count,Total Value\n';
      data.categoryBreakdown.forEach(cat => {
        csv += `${cat.category_name || 'Uncategorized'},${cat.item_count},${cat.category_value}\n`;
      });
    }
    
    return csv;
  }

  static convertToPDFText(data, reportType, period) {
    let content = `${reportType.toUpperCase()} REPORT\n`;
    content += `Period: ${period}\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += '=' * 50 + '\n\n';
    
    if (reportType === 'sales') {
      content += `Total Invoices: ${data.totalInvoices}\n`;
      content += `Total Amount: ₹${data.totalAmount?.toLocaleString('en-IN')}\n`;
      content += `Average Amount: ₹${data.averageAmount?.toLocaleString('en-IN')}\n\n`;
      
      if (data.topItems?.length > 0) {
        content += 'TOP SELLING ITEMS:\n';
        data.topItems.forEach((item, index) => {
          content += `${index + 1}. ${item.item_name} - Qty: ${item.total_quantity}, Amount: ₹${item.total_amount}\n`;
        });
      }
    }
    
    if (reportType === 'overview') {
      content += `Sales: ₹${data.sales?.totalAmount?.toLocaleString('en-IN') || 0}\n`;
      content += `Purchases: ₹${data.purchases?.totalAmount?.toLocaleString('en-IN') || 0}\n`;
      content += `Gross Profit: ₹${data.profit?.grossProfit?.toLocaleString('en-IN') || 0}\n`;
      content += `Profit Margin: ${data.profit?.profitMargin?.toFixed(2) || 0}%\n`;
    }
    
    return content;
  }

  static getDateRange(period) {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
        break;
      case 'this_week':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        startDate = weekStart.toISOString();
        endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        break;
      case 'this_quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        startDate = quarterStart.toISOString();
        endDate = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 1).toISOString();
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        endDate = new Date(now.getFullYear() + 1, 0, 1).toISOString();
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    }
    
    return { startDate, endDate };
  }

  static getDefaultOverviewData() {
    return {
      sales: { totalInvoices: 0, totalAmount: 0, averageAmount: 0, dailyTrend: [], topItems: [] },
      purchases: { totalPurchases: 0, totalAmount: 0, averageAmount: 0, dailyTrend: [] },
      customers: { totalCustomers: 0, totalSuppliers: 0, topCustomers: [], customerBalances: [] },
      inventory: { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0, categoryBreakdown: [] },
      profit: { totalIncome: 0, totalExpenses: 0, grossProfit: 0, profitMargin: 0 },
      period: 'this_month'
    };
  }
}

export default ReportsService;
