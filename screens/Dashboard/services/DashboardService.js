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

  static getKPIData() {
    return {
      toCollect: 125000,     // Outstanding receivables
      toPay: 75000,          // Outstanding payables
      stockValue: 285000,    // Total inventory value
      weekSales: 165000,     // This week's sales
      totalBalance: 450000,  // Cash + Bank balance
      
      // Trend data (percentage change from last period)
      toCollectTrend: -8.5,    // Decreased by 8.5% (good)
      toPayTrend: 12.3,        // Increased by 12.3%
      stockTrend: 5.7,         // Increased by 5.7%
      salesTrend: 18.2,        // Increased by 18.2% (excellent)
      balanceTrend: 15.4,      // Increased by 15.4% (great)
    };
  }

  static getSalesChartData() {
    return [
      { day: "Mon", sales: 18500, target: 15000 },
      { day: "Tue", sales: 22300, target: 15000 },
      { day: "Wed", sales: 19800, target: 15000 },
      { day: "Thu", sales: 25200, target: 15000 },
      { day: "Fri", sales: 28500, target: 15000 },
      { day: "Sat", sales: 32100, target: 15000 },
      { day: "Sun", sales: 24600, target: 15000 },
    ];
  }

  static getNotifications() {
    return [
      {
        id: 1,
        type: "warning",
        title: "Payment Overdue",
        message: "Invoice INV-2024-015 from Rajesh Electronics is 7 days overdue (₹25,000). Consider sending a follow-up.",
        timestamp: "2 hours ago",
        actionLabel: "Send Reminder",
        priority: "high"
      },
      {
        id: 2,
        type: "error",
        title: "Critical Stock Alert",
        message: "8 items are critically low in stock. Immediate reorder required to avoid customer disappointment.",
        timestamp: "4 hours ago",
        actionLabel: "Reorder Now",
        priority: "critical"
      },
      {
        id: 3,
        type: "success",
        title: "Sales Milestone",
        message: "Congratulations! You've achieved 125% of your monthly sales target with 5 days remaining.",
        timestamp: "6 hours ago",
        actionLabel: "View Analytics",
        priority: "medium"
      },
      {
        id: 4,
        type: "info",
        title: "GST Filing Reminder",
        message: "GST return filing is due in 2 days. All invoices updated and ready for submission.",
        timestamp: "1 day ago",
        actionLabel: "File GST Return",
        priority: "medium"
      },
      {
        id: 5,
        type: "warning",
        title: "Bank Reconciliation",
        message: "Bank statement has 3 unmatched transactions. Please review and reconcile.",
        timestamp: "1 day ago",
        actionLabel: "Reconcile",
        priority: "medium"
      }
    ];
  }

  static getRecentTransactions() {
    return [
      {
        id: "TXN001",
        type: "Sale",
        reference: "INV-2024-051",
        customer: "Rajesh Electronics",
        date: "25-Jan",
        amount: 45500,
        status: "Paid",
        category: "Electronics",
        paymentMethod: "UPI"
      },
      {
        id: "TXN002",
        type: "Purchase",
        reference: "PUR-2024-028",
        supplier: "Global Tech Distributors",
        date: "24-Jan",
        amount: 128500,
        status: "Pending",
        category: "Electronics",
        paymentMethod: "Bank Transfer"
      },
      {
        id: "TXN003",
        type: "Payment",
        reference: "PAY-2024-045",
        customer: "Delhi Mobile Store",
        date: "24-Jan",
        amount: 22800,
        status: "Received",
        category: "Mobile Accessories",
        paymentMethod: "Cash"
      },
      {
        id: "TXN004",
        type: "Sale",
        reference: "INV-2024-052",
        customer: "Mumbai Electronics Hub",
        date: "23-Jan",
        amount: 67500,
        status: "Pending",
        category: "Electronics",
        paymentMethod: "Credit"
      },
      {
        id: "TXN005",
        type: "Sale",
        reference: "INV-2024-053",
        customer: "Priya Mobile Center",
        date: "23-Jan",
        amount: 18950,
        status: "Paid",
        category: "Mobile Accessories",
        paymentMethod: "UPI"
      },
      {
        id: "TXN006",
        type: "Purchase",
        reference: "PUR-2024-029",
        supplier: "Wholesale Electronics Ltd",
        date: "22-Jan",
        amount: 95000,
        status: "Overdue",
        category: "Electronics",
        paymentMethod: "Bank Transfer"
      },
      {
        id: "TXN007",
        type: "Sale",
        reference: "INV-2024-054",
        customer: "Tech Solutions Pvt Ltd",
        date: "22-Jan",
        amount: 155200,
        status: "Paid",
        category: "Electronics",
        paymentMethod: "NEFT"
      },
      {
        id: "TXN008",
        type: "Payment",
        reference: "PAY-2024-046",
        customer: "Chennai Electronics",
        date: "21-Jan",
        amount: 34800,
        status: "Received",
        category: "Electronics",
        paymentMethod: "UPI"
      },
      {
        id: "TXN009",
        type: "Sale",
        reference: "INV-2024-055",
        customer: "Bangalore Tech Store",
        date: "21-Jan",
        amount: 89750,
        status: "Paid",
        category: "Electronics",
        paymentMethod: "Bank Transfer"
      },
      {
        id: "TXN010",
        type: "Purchase",
        reference: "PUR-2024-030",
        supplier: "National Electronics",
        date: "20-Jan",
        amount: 78500,
        status: "Paid",
        category: "Electronics",
        paymentMethod: "Cash"
      },
    ];
  }

  static getReportShortcuts() {
    return [
      { 
        id: 1, 
        title: "Sales Analytics", 
        icon: "📊", 
        color: "#10b981",
        description: "Detailed sales reports and trends",
        count: "15 reports"
      },
      { 
        id: 2, 
        title: "Inventory Management", 
        icon: "📦", 
        color: "#f59e0b",
        description: "Stock levels and reorder analysis",
        count: "245 items"
      },
      { 
        id: 3, 
        title: "GST & Tax Reports", 
        icon: "📋", 
        color: "#8b5cf6",
        description: "Tax compliance and GST filings",
        count: "Ready to file"
      },
      { 
        id: 4, 
        title: "Customer Analytics", 
        icon: "👥", 
        color: "#ef4444",
        description: "Customer behavior and insights",
        count: "150 customers"
      },
      { 
        id: 5, 
        title: "Profit & Loss", 
        icon: "💹", 
        color: "#06b6d4",
        description: "Financial performance analysis",
        count: "Monthly P&L"
      },
      { 
        id: 6, 
        title: "Cash Flow", 
        icon: "💰", 
        color: "#84cc16",
        description: "Cash flow forecasting and analysis",
        count: "90 days forecast"
      },
    ];
  }

  static getQuickActions() {
    return [
      {
        id: 1,
        title: "New Invoice",
        icon: "📄",
        backgroundColor: "#10b981",
        action: "CREATE_INVOICE",
        description: "Create a new sales invoice"
      },
      {
        id: 2,
        title: "Receive Payment",
        icon: "💰",
        backgroundColor: "#3b82f6",
        action: "RECEIVE_PAYMENT",
        description: "Record incoming payment"
      },
      {
        id: 3,
        title: "Quick Sale",
        icon: "🛒",
        backgroundColor: "#8b5cf6",
        action: "QUICK_SALE",
        description: "Process immediate sale"
      },
      {
        id: 4,
        title: "Add Stock",
        icon: "📦",
        backgroundColor: "#f59e0b",
        action: "ADD_STOCK",
        description: "Update inventory levels"
      },
      {
        id: 5,
        title: "Add Customer",
        icon: "👤",
        backgroundColor: "#ef4444",
        action: "ADD_CUSTOMER",
        description: "Register new customer"
      },
      {
        id: 6,
        title: "Record Expense",
        icon: "💳",
        backgroundColor: "#6366f1",
        action: "ADD_EXPENSE",
        description: "Log business expense"
      },
    ];
  }

  // Enhanced business profile data
  static getBusinessProfile() {
    return {
      businessName: "Brojgar Electronics Store",
      ownerName: "Ram Kumar Singh",
      businessType: "Electronics Retail & Wholesale",
      location: "Connaught Place, New Delhi",
      address: "Shop No. 45, Block A, Connaught Place, New Delhi - 110001",
      registeredDate: "2020-03-15",
      gstNumber: "07ABCDE1234F1Z5",
      phone: "+91 98765 43210",
      email: "ramkumar@brojgarstore.com",
      website: "www.brojgarelectronics.com",
      establishedYear: "2020",
      employeeCount: 8,
      monthlyTarget: 500000,
      currentMonthSales: 625000
    };
  }

  // Enhanced method to handle quick actions
  static handleQuickAction(action) {
    console.log(`Handling action: ${action}`);
    // In a real app, this would navigate to appropriate screens
    switch (action) {
      case "CREATE_INVOICE":
        return { 
          success: true, 
          message: "Opening Invoice Creation...", 
          action: "navigate",
          screen: "CreateInvoice"
        };
      case "RECEIVE_PAYMENT":
        return { 
          success: true, 
          message: "Opening Payment Receipt...", 
          action: "navigate",
          screen: "ReceivePayment"
        };
      case "QUICK_SALE":
        return { 
          success: true, 
          message: "Opening Quick Sale...", 
          action: "navigate",
          screen: "QuickSale"
        };
      case "ADD_STOCK":
        return { 
          success: true, 
          message: "Opening Inventory Management...", 
          action: "navigate",
          screen: "StockManagement"
        };
      case "ADD_CUSTOMER":
        return { 
          success: true, 
          message: "Opening Customer Registration...", 
          action: "navigate",
          screen: "AddCustomer"
        };
      case "ADD_EXPENSE":
        return { 
          success: true, 
          message: "Opening Expense Entry...", 
          action: "navigate",
          screen: "AddExpense"
        };
      default:
        return { 
          success: false, 
          message: "Unknown action",
          error: `Action '${action}' is not implemented`
        };
    }
  }

  static getDashboardSummary() {
    const kpi = this.getKPIData();
    const profile = this.getBusinessProfile();
    const netPosition = kpi.toCollect - kpi.toPay;
    const salesProgress = (profile.currentMonthSales / profile.monthlyTarget) * 100;
    
    return {
      netPosition,
      salesProgress: Math.round(salesProgress),
      statusMessage: netPosition > 0 
        ? "Strong financial position with positive cash flow" 
        : "Monitor payables carefully - consider collection efforts",
      cashFlow: kpi.totalBalance > 200000 
        ? "Excellent cash reserves" 
        : kpi.totalBalance > 100000 
        ? "Healthy cash flow" 
        : "Monitor cash flow - consider credit facilities",
      monthlyProgress: `${Math.round(salesProgress)}% of monthly target achieved`,
      salesTrend: kpi.salesTrend > 15 ? "Exceptional growth" :
                  kpi.salesTrend > 5 ? "Good growth" :
                  kpi.salesTrend > 0 ? "Steady progress" : "Needs attention"
    };
  }

  // Additional utility methods
  static getBusinessInsights() {
    const kpi = this.getKPIData();
    const transactions = this.getRecentTransactions();
    const summary = this.getDashboardSummary();
    
    return {
      totalTransactions: transactions.length,
      averageTransactionValue: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
      topCustomers: this.getTopCustomers(),
      salesGrowth: kpi.salesTrend,
      cashPosition: summary.cashFlow,
      alerts: this.getNotifications().filter(n => n.priority === 'critical' || n.priority === 'high').length
    };
  }

  static getTopCustomers() {
    const transactions = this.getRecentTransactions();
    const customerTotals = {};
    
    transactions
      .filter(t => t.type === 'Sale' && t.customer)
      .forEach(t => {
        customerTotals[t.customer] = (customerTotals[t.customer] || 0) + t.amount;
      });
    
    return Object.entries(customerTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([customer, total]) => ({ customer, total }));
  }

  static searchTransactions(query, transactions = null) {
    const txns = transactions || this.getRecentTransactions();
    if (!query || query.trim() === '') return txns;
    
    const searchTerm = query.toLowerCase();
    return txns.filter(transaction =>
      transaction.customer?.toLowerCase().includes(searchTerm) ||
      transaction.supplier?.toLowerCase().includes(searchTerm) ||
      transaction.reference.toLowerCase().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm) ||
      transaction.category?.toLowerCase().includes(searchTerm) ||
      transaction.status.toLowerCase().includes(searchTerm)
    );
  }

  static getTransactionsByStatus(status) {
    return this.getRecentTransactions().filter(t => t.status.toLowerCase() === status.toLowerCase());
  }

  static getTransactionsByType(type) {
    return this.getRecentTransactions().filter(t => t.type.toLowerCase() === type.toLowerCase());
  }

  static calculateBusinessMetrics() {
    const kpi = this.getKPIData();
    const transactions = this.getRecentTransactions();
    const sales = transactions.filter(t => t.type === 'Sale');
    const purchases = transactions.filter(t => t.type === 'Purchase');
    
    return {
      totalSales: sales.reduce((sum, t) => sum + t.amount, 0),
      totalPurchases: purchases.reduce((sum, t) => sum + t.amount, 0),
      averageSaleValue: sales.length > 0 ? sales.reduce((sum, t) => sum + t.amount, 0) / sales.length : 0,
      salesCount: sales.length,
      purchaseCount: purchases.length,
      netRevenue: sales.reduce((sum, t) => sum + t.amount, 0) - purchases.reduce((sum, t) => sum + t.amount, 0),
      receivablesRatio: (kpi.toCollect / kpi.totalBalance) * 100,
      payablesRatio: (kpi.toPay / kpi.totalBalance) * 100
    };
  }
}

export default DashboardService;