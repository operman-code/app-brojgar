// screens/Reports/services/ReportsService.js
import DatabaseService from '../../../database/DatabaseService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

class ReportsService {
  
  // Generate all reports
  static async generateAllReports() {
    try {
      const [
        overview,
        sales,
        purchases,
        inventory,
        customers,
        gst
      ] = await Promise.all([
        this.generateOverviewReport(),
        this.generateSalesReport(),
        this.generatePurchasesReport(),
        this.generateInventoryReport(),
        this.generateCustomersReport(),
        this.generateGSTReport()
      ]);

      return {
        overview,
        sales,
        purchases,
        inventory,
        customers,
        gst,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error generating reports:', error);
      return this.getMockReports();
    }
  }

  // Generate Overview Report
  static async generateOverviewReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockOverviewReport();
      }

      // Get total sales
      const salesResult = await db.getFirstAsync(`
        SELECT 
          COALESCE(SUM(total), 0) as totalSales,
          COUNT(*) as totalInvoices
        FROM invoices 
        WHERE status != 'cancelled'
      `);

      // Get total purchases/expenses
      const purchasesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as totalPurchases
        FROM expenses
      `);

      // Get outstanding receivables
      const receivablesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(balance_amount), 0) as amount
        FROM invoices
        WHERE balance_amount > 0 AND status != 'cancelled'
      `);

      // Get outstanding payables
      const payablesResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as amount
        FROM expenses
        WHERE expense_date <= date('now')
        AND id NOT IN (SELECT reference_id FROM payments WHERE reference_type = 'expense')
      `);

      // Get inventory value
      const inventoryResult = await db.getFirstAsync(`
        SELECT 
          COALESCE(SUM(current_stock * cost_price), 0) as totalValue,
          COUNT(*) as totalItems
        FROM items
        WHERE is_active = 1
      `);

      // Get low stock count
      const lowStockResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM items
        WHERE current_stock <= minimum_stock AND is_active = 1
      `);

      // Get customer count
      const customerResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM parties
        WHERE type IN ('customer', 'both') AND is_active = 1
      `);

      const totalSales = salesResult?.totalSales || 0;
      const totalPurchases = purchasesResult?.totalPurchases || 0;

      return {
        totalSales,
        totalPurchases,
        netProfit: totalSales - totalPurchases,
        totalCustomers: customerResult?.count || 0,
        totalInvoices: salesResult?.totalInvoices || 0,
        outstandingReceivables: receivablesResult?.amount || 0,
        outstandingPayables: payablesResult?.amount || 0,
        inventoryValue: inventoryResult?.totalValue || 0,
        totalItems: inventoryResult?.totalItems || 0,
        lowStockCount: lowStockResult?.count || 0
      };
    } catch (error) {
      console.error('❌ Error generating overview report:', error);
      return this.getMockOverviewReport();
    }
  }

  // Generate Sales Report
  static async generateSalesReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockSalesReport();
      }

      // Get this month sales
      const thisMonthResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(total), 0) as amount
        FROM invoices
        WHERE strftime('%Y-%m', invoice_date) = strftime('%Y-%m', 'now')
        AND status != 'cancelled'
      `);

      // Get last month sales
      const lastMonthResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(total), 0) as amount
        FROM invoices
        WHERE strftime('%Y-%m', invoice_date) = strftime('%Y-%m', date('now', '-1 month'))
        AND status != 'cancelled'
      `);

      // Get total invoices
      const invoicesResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM invoices
        WHERE status != 'cancelled'
      `);

      // Get average order value
      const avgOrderResult = await db.getFirstAsync(`
        SELECT COALESCE(AVG(total), 0) as avgValue
        FROM invoices
        WHERE status != 'cancelled'
      `);

      // Get top products
      const topProducts = await db.getAllAsync(`
        SELECT 
          ii.item_id,
          i.name,
          SUM(ii.quantity) as quantity,
          SUM(ii.total) as revenue
        FROM invoice_items ii
        JOIN items i ON ii.item_id = i.id
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE inv.status != 'cancelled'
        GROUP BY ii.item_id, i.name
        ORDER BY revenue DESC
        LIMIT 10
      `);

      // Get top customers
      const topCustomers = await db.getAllAsync(`
        SELECT 
          i.party_id as id,
          p.name,
          COUNT(i.id) as invoiceCount,
          SUM(i.total) as totalPurchased
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.status != 'cancelled'
        GROUP BY i.party_id, p.name
        ORDER BY totalPurchased DESC
        LIMIT 10
      `);

      return {
        thisMonth: thisMonthResult?.amount || 0,
        lastMonth: lastMonthResult?.amount || 0,
        totalInvoices: invoicesResult?.count || 0,
        averageOrderValue: avgOrderResult?.avgValue || 0,
        topProducts: topProducts || [],
        topCustomers: topCustomers || []
      };
    } catch (error) {
      console.error('❌ Error generating sales report:', error);
      return this.getMockSalesReport();
    }
  }

  // Generate Inventory Report
  static async generateInventoryReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockInventoryReport();
      }

      // Get inventory summary
      const summaryResult = await db.getFirstAsync(`
        SELECT 
          COUNT(*) as totalItems,
          COALESCE(SUM(current_stock * cost_price), 0) as totalValue
        FROM items
        WHERE is_active = 1
      `);

      // Get low stock items count
      const lowStockResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM items
        WHERE current_stock <= minimum_stock AND current_stock > 0 AND is_active = 1
      `);

      // Get out of stock items count
      const outOfStockResult = await db.getFirstAsync(`
        SELECT COUNT(*) as count
        FROM items
        WHERE current_stock = 0 AND is_active = 1
      `);

      // Get low stock items list
      const lowStockList = await db.getAllAsync(`
        SELECT 
          id,
          name,
          current_stock,
          minimum_stock,
          unit,
          (current_stock * cost_price) as value
        FROM items
        WHERE current_stock <= minimum_stock AND current_stock > 0 AND is_active = 1
        ORDER BY current_stock ASC
        LIMIT 20
      `);

      // Get category wise stock
      const categoryWise = await db.getAllAsync(`
        SELECT 
          c.name as category,
          COUNT(i.id) as itemCount,
          COALESCE(SUM(i.current_stock * i.cost_price), 0) as totalValue
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.is_active = 1
        GROUP BY c.name
        ORDER BY totalValue DESC
      `);

      return {
        totalItems: summaryResult?.totalItems || 0,
        totalValue: summaryResult?.totalValue || 0,
        lowStockItems: lowStockResult?.count || 0,
        outOfStockItems: outOfStockResult?.count || 0,
        lowStockList: lowStockList || [],
        categoryWise: categoryWise || []
      };
    } catch (error) {
      console.error('❌ Error generating inventory report:', error);
      return this.getMockInventoryReport();
    }
  }

  // Generate GST Report
  static async generateGSTReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockGSTReport();
      }

      // Get total taxable sales and output GST
      const salesGSTResult = await db.getFirstAsync(`
        SELECT 
          COALESCE(SUM(subtotal), 0) as totalTaxableSales,
          COALESCE(SUM(tax_amount), 0) as outputGST
        FROM invoices
        WHERE status != 'cancelled'
      `);

      // Get input GST (from purchases)
      const purchaseGSTResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(tax_amount), 0) as inputGST
        FROM expenses
        WHERE tax_amount > 0
      `);

      // Get tax rate wise breakdown
      const taxRateWise = await db.getAllAsync(`
        SELECT 
          tax_rate as taxRate,
          COALESCE(SUM(subtotal), 0) as taxableAmount,
          COALESCE(SUM(tax_amount), 0) as taxAmount
        FROM invoices
        WHERE status != 'cancelled' AND tax_rate > 0
        GROUP BY tax_rate
        ORDER BY tax_rate ASC
      `);

      const outputGST = salesGSTResult?.outputGST || 0;
      const inputGST = purchaseGSTResult?.inputGST || 0;

      return {
        totalTaxableSales: salesGSTResult?.totalTaxableSales || 0,
        outputGST,
        inputGST,
        netGST: outputGST - inputGST,
        taxRateWise: taxRateWise || []
      };
    } catch (error) {
      console.error('❌ Error generating GST report:', error);
      return this.getMockGSTReport();
    }
  }

  // Generate Purchases Report
  static async generatePurchasesReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockPurchasesReport();
      }

      // Similar structure to sales report but for purchases
      const thisMonthResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as amount
        FROM expenses
        WHERE strftime('%Y-%m', expense_date) = strftime('%Y-%m', 'now')
      `);

      const lastMonthResult = await db.getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as amount
        FROM expenses
        WHERE strftime('%Y-%m', expense_date) = strftime('%Y-%m', date('now', '-1 month'))
      `);

      return {
        thisMonth: thisMonthResult?.amount || 0,
        lastMonth: lastMonthResult?.amount || 0,
        totalExpenses: thisMonthResult?.amount || 0,
        averageExpense: thisMonthResult?.amount || 0
      };
    } catch (error) {
      console.error('❌ Error generating purchases report:', error);
      return this.getMockPurchasesReport();
    }
  }

  // Generate Customers Report
  static async generateCustomersReport() {
    try {
      const db = await DatabaseService.getDatabase();
      
      if (!db) {
        return this.getMockCustomersReport();
      }

      // Get top customers
      const topCustomers = await db.getAllAsync(`
        SELECT 
          p.id,
          p.name,
          COUNT(i.id) as invoiceCount,
          COALESCE(SUM(i.total), 0) as totalPurchased,
          COALESCE(SUM(i.balance_amount), 0) as outstandingAmount
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.status != 'cancelled'
        WHERE p.type IN ('customer', 'both') AND p.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY totalPurchased DESC
        LIMIT 20
      `);

      return {
        topCustomers: topCustomers || [],
        totalCustomers: topCustomers.length
      };
    } catch (error) {
      console.error('❌ Error generating customers report:', error);
      return this.getMockCustomersReport();
    }
  }

  // Export to PDF
  static async exportToPDF(reportType, reportData) {
    try {
      const htmlContent = this.generateReportHTML(reportType, reportData);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      const fileName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      }
    } catch (error) {
      console.error('❌ Error exporting to PDF:', error);
      throw error;
    }
  }

  // Export to Excel (CSV format)
  static async exportToExcel(reportType, reportData) {
    try {
      const csvContent = this.generateCSVContent(reportType, reportData);
      const fileName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      throw error;
    }
  }

  // Generate HTML for PDF export
  static generateReportHTML(reportType, reportData) {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .amount { text-align: right; font-weight: bold; }
      </style>
    `;

    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportType.toUpperCase()} Report</title>
        ${styles}
      </head>
      <body>
        <h1>${reportType.toUpperCase()} Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
    `;

    // Add report-specific content based on type
    switch (reportType) {
      case 'overview':
        content += this.generateOverviewHTML(reportData);
        break;
      case 'sales':
        content += this.generateSalesHTML(reportData);
        break;
      case 'inventory':
        content += this.generateInventoryHTML(reportData);
        break;
      case 'gst':
        content += this.generateGSTHTML(reportData);
        break;
      default:
        content += '<p>Report content not available</p>';
    }

    content += '</body></html>';
    return content;
  }

  // Generate CSV content
  static generateCSVContent(reportType, reportData) {
    let csvContent = `${reportType.toUpperCase()} Report\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    switch (reportType) {
      case 'sales':
        if (reportData.topProducts) {
          csvContent += 'Top Products\n';
          csvContent += 'Product Name,Quantity Sold,Revenue\n';
          reportData.topProducts.forEach(product => {
            csvContent += `"${product.name}",${product.quantity},${product.revenue}\n`;
          });
        }
        break;
      case 'inventory':
        if (reportData.lowStockList) {
          csvContent += 'Low Stock Items\n';
          csvContent += 'Item Name,Current Stock,Minimum Stock,Unit,Value\n';
          reportData.lowStockList.forEach(item => {
            csvContent += `"${item.name}",${item.current_stock},${item.minimum_stock},"${item.unit}",${item.value}\n`;
          });
        }
        break;
      default:
        csvContent += 'Report data not available in CSV format\n';
    }

    return csvContent;
  }

  // Generate HTML sections for different reports
  static generateOverviewHTML(data) {
    return `
      <div class="summary">
        <h2>Business Summary</h2>
        <table>
          <tr><td>Total Sales</td><td class="amount">₹${data.totalSales?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Total Purchases</td><td class="amount">₹${data.totalPurchases?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Net Profit</td><td class="amount">₹${data.netProfit?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Total Customers</td><td class="amount">${data.totalCustomers || '0'}</td></tr>
          <tr><td>Outstanding Receivables</td><td class="amount">₹${data.outstandingReceivables?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Inventory Value</td><td class="amount">₹${data.inventoryValue?.toLocaleString('en-IN') || '0'}</td></tr>
        </table>
      </div>
    `;
  }

  static generateSalesHTML(data) {
    let html = `
      <div class="summary">
        <h2>Sales Summary</h2>
        <table>
          <tr><td>This Month</td><td class="amount">₹${data.thisMonth?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Last Month</td><td class="amount">₹${data.lastMonth?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Total Invoices</td><td class="amount">${data.totalInvoices || '0'}</td></tr>
          <tr><td>Average Order Value</td><td class="amount">₹${data.averageOrderValue?.toLocaleString('en-IN') || '0'}</td></tr>
        </table>
      </div>
    `;

    if (data.topProducts && data.topProducts.length > 0) {
      html += `
        <h2>Top Products</h2>
        <table>
          <tr><th>Product Name</th><th>Quantity Sold</th><th>Revenue</th></tr>
      `;
      data.topProducts.forEach(product => {
        html += `<tr><td>${product.name}</td><td>${product.quantity}</td><td class="amount">₹${product.revenue?.toLocaleString('en-IN')}</td></tr>`;
      });
      html += '</table>';
    }

    return html;
  }

  static generateInventoryHTML(data) {
    let html = `
      <div class="summary">
        <h2>Inventory Summary</h2>
        <table>
          <tr><td>Total Items</td><td class="amount">${data.totalItems || '0'}</td></tr>
          <tr><td>Total Value</td><td class="amount">₹${data.totalValue?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Low Stock Items</td><td class="amount">${data.lowStockItems || '0'}</td></tr>
          <tr><td>Out of Stock Items</td><td class="amount">${data.outOfStockItems || '0'}</td></tr>
        </table>
      </div>
    `;

    if (data.lowStockList && data.lowStockList.length > 0) {
      html += `
        <h2>Low Stock Items</h2>
        <table>
          <tr><th>Item Name</th><th>Current Stock</th><th>Minimum Stock</th><th>Unit</th><th>Value</th></tr>
      `;
      data.lowStockList.forEach(item => {
        html += `<tr><td>${item.name}</td><td>${item.current_stock}</td><td>${item.minimum_stock}</td><td>${item.unit}</td><td class="amount">₹${item.value?.toLocaleString('en-IN')}</td></tr>`;
      });
      html += '</table>';
    }

    return html;
  }

  static generateGSTHTML(data) {
    return `
      <div class="summary">
        <h2>GST Summary</h2>
        <table>
          <tr><td>Total Taxable Sales</td><td class="amount">₹${data.totalTaxableSales?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Output GST Collected</td><td class="amount">₹${data.outputGST?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td>Input GST Paid</td><td class="amount">₹${data.inputGST?.toLocaleString('en-IN') || '0'}</td></tr>
          <tr><td><strong>Net GST Payable</strong></td><td class="amount"><strong>₹${data.netGST?.toLocaleString('en-IN') || '0'}</strong></td></tr>
        </table>
      </div>
    `;
  }

  // Mock data methods for when database is not available
  static getMockReports() {
    return {
      overview: this.getMockOverviewReport(),
      sales: this.getMockSalesReport(),
      purchases: this.getMockPurchasesReport(),
      inventory: this.getMockInventoryReport(),
      customers: this.getMockCustomersReport(),
      gst: this.getMockGSTReport(),
      generatedAt: new Date().toISOString()
    };
  }

  static getMockOverviewReport() {
    return {
      totalSales: 450000,
      totalPurchases: 280000,
      netProfit: 170000,
      totalCustomers: 35,
      totalInvoices: 125,
      outstandingReceivables: 85000,
      outstandingPayables: 45000,
      inventoryValue: 320000,
      totalItems: 89,
      lowStockCount: 12
    };
  }

  static getMockSalesReport() {
    return {
      thisMonth: 125000,
      lastMonth: 98000,
      totalInvoices: 45,
      averageOrderValue: 2780,
      topProducts: [
        { id: '1', name: 'iPhone 15 Pro', quantity: 15, revenue: 135000 },
        { id: '2', name: 'Samsung Galaxy S24', quantity: 12, revenue: 96000 },
        { id: '3', name: 'MacBook Air M2', quantity: 8, revenue: 80000 }
      ],
      topCustomers: [
        { id: '1', name: 'ABC Electronics', invoiceCount: 8, totalPurchased: 45000 },
        { id: '2', name: 'Tech Solutions Ltd', invoiceCount: 6, totalPurchased: 38000 },
        { id: '3', name: 'Digital Store', invoiceCount: 5, totalPurchased: 32000 }
      ]
    };
  }

  static getMockInventoryReport() {
    return {
      totalItems: 89,
      totalValue: 320000,
      lowStockItems: 12,
      outOfStockItems: 3,
      lowStockList: [
        { id: '1', name: 'iPhone 15 Pro', current_stock: 2, minimum_stock: 5, unit: 'pcs', value: 30000 },
        { id: '2', name: 'AirPods Pro', current_stock: 1, minimum_stock: 10, unit: 'pcs', value: 2500 },
        { id: '3', name: 'iPad Air', current_stock: 3, minimum_stock: 8, unit: 'pcs', value: 18000 }
      ],
      categoryWise: [
        { category: 'Smartphones', itemCount: 25, totalValue: 125000 },
        { category: 'Laptops', itemCount: 15, totalValue: 98000 },
        { category: 'Accessories', itemCount: 35, totalValue: 45000 }
      ]
    };
  }

  static getMockGSTReport() {
    return {
      totalTaxableSales: 381355,
      outputGST: 68644,
      inputGST: 45000,
      netGST: 23644,
      taxRateWise: [
        { taxRate: 5, taxableAmount: 50000, taxAmount: 2500 },
        { taxRate: 12, taxableAmount: 75000, taxAmount: 9000 },
        { taxRate: 18, taxableAmount: 256355, taxAmount: 46144 },
        { taxRate: 28, taxableAmount: 0, taxAmount: 0 }
      ]
    };
  }

  static getMockPurchasesReport() {
    return {
      thisMonth: 85000,
      lastMonth: 72000,
      totalExpenses: 85000,
      averageExpense: 2125
    };
  }

  static getMockCustomersReport() {
    return {
      totalCustomers: 35,
      topCustomers: [
        { id: '1', name: 'ABC Electronics', invoiceCount: 8, totalPurchased: 45000, outstandingAmount: 12000 },
        { id: '2', name: 'Tech Solutions Ltd', invoiceCount: 6, totalPurchased: 38000, outstandingAmount: 8000 },
        { id: '3', name: 'Digital Store', invoiceCount: 5, totalPurchased: 32000, outstandingAmount: 0 }
      ]
    };
  }
}

export default ReportsService;