// screens/Reports/services/ReportsService.js
import DashboardService from "../../Dashboard/services/DashboardService";
import PartiesService from "../../Parties/services/PartiesService";
import InventoryService from "../../Inventory/services/InventoryService";

class ReportsService {
  
  // Generate comprehensive business reports
  static async generateAllReports() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const overview = this.generateOverviewReport();
        const sales = this.generateSalesReport();
        const inventory = this.generateInventoryReport();
        const parties = this.generatePartiesReport();
        const financial = this.generateFinancialReport();

        resolve({
          overview,
          sales,
          inventory,
          parties,
          financial,
          generatedAt: new Date().toISOString(),
        });
      }, 800);
    });
  }

  // Overview Report
  static generateOverviewReport() {
    const businessMetrics = DashboardService.calculateBusinessMetrics();
    const inventoryStats = InventoryService.getInventoryStatistics();
    const partiesStats = PartiesService.getPartiesStatistics();
    
    return {
      totalRevenue: businessMetrics.totalSales || 0,
      totalExpenses: businessMetrics.totalPurchases || 0,
      netProfit: businessMetrics.netRevenue || 0,
      profitMargin: businessMetrics.totalSales > 0 ? 
        ((businessMetrics.netRevenue / businessMetrics.totalSales) * 100).toFixed(2) : 0,
      
      // Growth metrics (mock data - in real app would compare with previous periods)
      revenueGrowth: 18.2,
      customerGrowth: 12.5,
      inventoryGrowth: 8.3,
      
      // Key performance indicators
      averageOrderValue: businessMetrics.averageSaleValue || 0,
      totalCustomers: partiesStats.totalCustomers,
      totalSuppliers: partiesStats.totalSuppliers,
      inventoryValue: inventoryStats.totalStockValue,
      
      // Health scores (0-100)
      businessHealthScore: 85,
      cashFlowHealth: 90,
      inventoryHealth: 75,
      customerHealth: 80,
    };
  }

  // Sales Report
  static generateSalesReport() {
    const businessMetrics = DashboardService.calculateBusinessMetrics();
    const salesChartData = DashboardService.getSalesChartData();
    const topCustomers = PartiesService.getTopCustomers(10);
    
    // Calculate sales trends and patterns
    const weeklySales = salesChartData.reduce((sum, day) => sum + day.sales, 0);
    const weeklyTarget = salesChartData.reduce((sum, day) => sum + (day.target || 15000), 0);
    const targetAchievement = (weeklySales / weeklyTarget) * 100;

    // Generate monthly sales data (mock)
    const monthlySalesData = this.generateMonthlySalesData();
    
    return {
      totalSales: businessMetrics.totalSales || 0,
      salesCount: businessMetrics.salesCount || 0,
      averageSaleValue: businessMetrics.averageSaleValue || 0,
      weeklySales,
      weeklyTarget,
      targetAchievement,
      
      // Sales breakdown
      salesByCategory: this.generateSalesByCategory(),
      salesByPaymentMethod: this.generateSalesByPaymentMethod(),
      monthlySalesData,
      
      // Customer analytics
      topCustomers: topCustomers.slice(0, 5),
      newCustomersThisMonth: 8,
      repeatCustomerRate: 67,
      customerRetentionRate: 85,
      
      // Performance metrics
      salesGrowthRate: 18.2,
      bestSellingDay: "Saturday",
      peakSalesHour: "2 PM - 4 PM",
      seasonalTrend: "Growing",
    };
  }

  // Inventory Report
  static generateInventoryReport() {
    const inventoryStats = InventoryService.getInventoryStatistics();
    const lowStockItems = InventoryService.getLowStockItems();
    const outOfStockItems = InventoryService.getOutOfStockItems();
    const topSellingItems = InventoryService.getTopSellingItems();
    
    return {
      totalItems: inventoryStats.totalItems,
      totalStockValue: inventoryStats.totalStockValue,
      totalRetailValue: inventoryStats.totalRetailValue,
      potentialProfit: inventoryStats.potentialProfit,
      
      // Stock status
      inStockItems: inventoryStats.totalItems - inventoryStats.outOfStockCount,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      overstockItems: inventoryStats.overstockCount,
      
      // Category breakdown
      categoryStats: inventoryStats.categoryStats,
      topSellingItems: topSellingItems.slice(0, 5),
      
      // Reorder analysis
      reorderAlerts: [...outOfStockItems, ...lowStockItems].slice(0, 10),
      reorderValue: this.calculateReorderValue(outOfStockItems, lowStockItems),
      
      // Inventory turnover (mock data)
      inventoryTurnover: 4.2,
      averageStockAge: 45, // days
      fastMovingItems: 8,
      slowMovingItems: 3,
      
      // Profitability
      highMarginItems: inventoryStats.totalItems * 0.3, // 30% high margin
      lowMarginItems: inventoryStats.totalItems * 0.15, // 15% low margin
    };
  }

  // Parties Report
  static generatePartiesReport() {
    const partiesStats = PartiesService.getPartiesStatistics();
    const topCustomers = PartiesService.getTopCustomers(10);
    const topSuppliers = PartiesService.getTopSuppliers(5);
    const overdueParties = PartiesService.getOverdueParties();
    
    return {
      totalParties: partiesStats.totalParties,
      totalCustomers: partiesStats.totalCustomers,
      totalSuppliers: partiesStats.totalSuppliers,
      
      // Financial summary
      totalReceivables: partiesStats.totalReceivables,
      totalPayables: partiesStats.totalPayables,
      netPosition: partiesStats.netPosition,
      
      // Customer analytics
      topCustomers: topCustomers.slice(0, 5),
      averageCustomerValue: partiesStats.averageCustomerBalance,
      customersWithCredit: topCustomers.filter(c => c.balance > 0).length,
      
      // Supplier analytics
      topSuppliers: topSuppliers.slice(0, 3),
      averageSupplierBalance: partiesStats.averageSupplierBalance,
      suppliersWithPending: topSuppliers.filter(s => s.balance < 0).length,
      
      // Payment analysis
      overdueParties: overdueParties.length,
      overdueAmount: overdueParties.reduce((sum, party) => sum + Math.abs(party.balance), 0),
      
      // Growth metrics
      newPartiesThisMonth: 3,
      partiesGrowthRate: 8.5,
      paymentEfficiency: 78, // percentage
      
      // Risk analysis
      highRiskCustomers: overdueParties.filter(p => p.type === 'customer').length,
      creditLimitUtilization: 65, // percentage
    };
  }

  // Financial Report
  static generateFinancialReport() {
    const businessMetrics = DashboardService.calculateBusinessMetrics();
    const partiesStats = PartiesService.getPartiesStatistics();
    const inventoryStats = InventoryService.getInventoryStatistics();
    
    // Calculate financial ratios
    const currentRatio = this.calculateCurrentRatio(inventoryStats, partiesStats);
    const quickRatio = this.calculateQuickRatio(partiesStats);
    const debtToEquityRatio = this.calculateDebtToEquityRatio(partiesStats);
    
    return {
      // Income Statement
      revenue: businessMetrics.totalSales || 0,
      costOfGoodsSold: businessMetrics.totalPurchases || 0,
      grossProfit: (businessMetrics.totalSales || 0) - (businessMetrics.totalPurchases || 0),
      operatingExpenses: this.estimateOperatingExpenses(businessMetrics.totalSales),
      netIncome: businessMetrics.netRevenue || 0,
      
      // Balance Sheet Items
      currentAssets: inventoryStats.totalStockValue + partiesStats.totalReceivables,
      inventoryValue: inventoryStats.totalStockValue,
      accountsReceivable: partiesStats.totalReceivables,
      accountsPayable: partiesStats.totalPayables,
      
      // Financial Ratios
      currentRatio,
      quickRatio,
      debtToEquityRatio,
      grossProfitMargin: businessMetrics.totalSales > 0 ? 
        (((businessMetrics.totalSales - businessMetrics.totalPurchases) / businessMetrics.totalSales) * 100).toFixed(2) : 0,
      netProfitMargin: businessMetrics.totalSales > 0 ? 
        ((businessMetrics.netRevenue / businessMetrics.totalSales) * 100).toFixed(2) : 0,
      
      // Cash Flow Analysis
      cashFromOperations: businessMetrics.netRevenue + (businessMetrics.totalPurchases * 0.1), // Simplified
      cashFromInvesting: -(inventoryStats.totalStockValue * 0.05), // Equipment purchases
      cashFromFinancing: partiesStats.totalPayables * 0.1, // Loan payments
      netCashFlow: businessMetrics.netRevenue,
      
      // Performance Metrics
      returnOnAssets: 15.2, // Mock percentage
      returnOnEquity: 22.8, // Mock percentage
      assetTurnover: 2.1, // Mock ratio
      
      // Trends (mock data - in real app would be calculated from historical data)
      monthlyProfitTrend: [12000, 15000, 18000, 22000, 25000, 28000],
      quarterlyGrowth: 24.5,
      yearOverYearGrowth: 45.8,
    };
  }

  // Helper Methods
  static generateMonthlySalesData() {
    // Mock monthly sales data for the current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 30000 + (index * 2000), // Growing trend
      target: 45000,
      profit: Math.floor(Math.random() * 15000) + 8000 + (index * 600),
    }));
  }

  static generateSalesByCategory() {
    return [
      { category: 'Mobile Accessories', sales: 125000, percentage: 35.2 },
      { category: 'Electronics', sales: 98000, percentage: 27.6 },
      { category: 'Computers', sales: 76000, percentage: 21.4 },
      { category: 'Audio', sales: 45000, percentage: 12.7 },
      { category: 'Gaming', sales: 11000, percentage: 3.1 },
    ];
  }

  static generateSalesByPaymentMethod() {
    return [
      { method: 'UPI', sales: 145000, percentage: 40.8 },
      { method: 'Cash', sales: 98000, percentage: 27.6 },
      { method: 'Bank Transfer', sales: 67000, percentage: 18.9 },
      { method: 'Credit', sales: 45000, percentage: 12.7 },
    ];
  }

  static calculateReorderValue(outOfStockItems, lowStockItems) {
    let reorderValue = 0;
    
    [...outOfStockItems, ...lowStockItems].forEach(item => {
      const reorderQuantity = Math.max(item.minStock * 2, item.maxStock - item.stock);
      reorderValue += reorderQuantity * item.costPrice;
    });
    
    return reorderValue;
  }

  static calculateCurrentRatio(inventoryStats, partiesStats) {
    const currentAssets = inventoryStats.totalStockValue + partiesStats.totalReceivables;
    const currentLiabilities = partiesStats.totalPayables;
    return currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : 0;
  }

  static calculateQuickRatio(partiesStats) {
    const quickAssets = partiesStats.totalReceivables; // Excluding inventory
    const currentLiabilities = partiesStats.totalPayables;
    return currentLiabilities > 0 ? (quickAssets / currentLiabilities).toFixed(2) : 0;
  }

  static calculateDebtToEquityRatio(partiesStats) {
    const totalDebt = partiesStats.totalPayables;
    const equity = partiesStats.totalReceivables * 1.5; // Simplified equity calculation
    return equity > 0 ? (totalDebt / equity).toFixed(2) : 0;
  }

  static estimateOperatingExpenses(revenue) {
    // Estimate operating expenses as percentage of revenue
    return Math.floor(revenue * 0.15); // 15% of revenue
  }

  // Export reports in different formats
  static exportReport(reportType, format = 'json', data) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportType}_${timestamp}`;
    
    if (format === 'json') {
      return {
        filename: `${filename}.json`,
        content: JSON.stringify(data, null, 2),
        mimeType: 'application/json'
      };
    } else if (format === 'csv') {
      return {
        filename: `${filename}.csv`,
        content: this.convertToCSV(data),
        mimeType: 'text/csv'
      };
    }
  }

  static convertToCSV(data) {
    // Simple CSV conversion for flat objects
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csvData = data.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      );
      return [headers.join(','), ...csvData].join('\n');
    } else {
      const headers = Object.keys(data);
      const values = Object.values(data);
      return `${headers.join(',')}\n${values.map(v => `"${v}"`).join(',')}`;
    }
  }

  // Generate summary report for dashboard
  static generateQuickSummary() {
    const businessMetrics = DashboardService.calculateBusinessMetrics();
    const inventoryStats = InventoryService.getInventoryStatistics();
    const partiesStats = PartiesService.getPartiesStatistics();
    
    return {
      totalRevenue: InventoryService.formatCurrency(businessMetrics.totalSales || 0),
      totalProfit: InventoryService.formatCurrency(businessMetrics.netRevenue || 0),
      totalCustomers: partiesStats.totalCustomers,
      totalProducts: inventoryStats.totalItems,
      lowStockAlerts: inventoryStats.lowStockCount,
      outOfStockAlerts: inventoryStats.outOfStockCount,
      overduePayments: PartiesService.getOverdueParties().length,
      healthScore: 85, // Overall business health score
    };
  }

  // Generate period comparison report
  static generatePeriodComparison(currentPeriod, previousPeriod) {
    // Mock implementation - in real app would compare actual data
    return {
      revenue: {
        current: 355000,
        previous: 298000,
        change: 19.1,
        trend: 'up'
      },
      customers: {
        current: 150,
        previous: 134,
        change: 11.9,
        trend: 'up'
      },
      orders: {
        current: 245,
        previous: 198,
        change: 23.7,
        trend: 'up'
      },
      avgOrderValue: {
        current: 1449,
        previous: 1505,
        change: -3.7,
        trend: 'down'
      }
    };
  }

  // Generate business intelligence insights
  static generateBusinessInsights() {
    return {
      insights: [
        {
          type: 'opportunity',
          title: 'High-Margin Product Focus',
          description: 'Mobile accessories show the highest profit margins. Consider expanding this category.',
          impact: 'high',
          category: 'sales'
        },
        {
          type: 'warning',
          title: 'Inventory Optimization Needed',
          description: 'Several items are overstocked while others are out of stock. Review reorder points.',
          impact: 'medium',
          category: 'inventory'
        },
        {
          type: 'success',
          title: 'Customer Retention Strong',
          description: 'Repeat customer rate is 67%, indicating good customer satisfaction.',
          impact: 'positive',
          category: 'customers'
        },
        {
          type: 'alert',
          title: 'Payment Collection Required',
          description: 'Outstanding receivables have increased. Follow up with overdue customers.',
          impact: 'medium',
          category: 'finance'
        }
      ],
      recommendations: [
        'Focus marketing efforts on mobile accessories for higher margins',
        'Implement automated reorder points for inventory management',
        'Create a customer loyalty program to increase retention',
        'Set up automated payment reminders for overdue accounts'
      ]
    };
  }

  // Format currency for reports
  static formatCurrency(amount) {
    return InventoryService.formatCurrency(amount);
  }

  // Generate report metadata
  static generateReportMetadata(reportType) {
    return {
      reportType,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Brojgar Business Management System',
      version: '1.0',
      dataSource: 'Local Database',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    };
  }
}

export default ReportsService;