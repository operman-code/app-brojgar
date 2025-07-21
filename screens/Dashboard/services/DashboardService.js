class DashboardService {
  static formatCurrency(amount) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  static getKPIData() {
    return {
      toCollect: 25000,      // Outstanding receivables
      toPay: 12500,          // Outstanding payables
      stockValue: 185000,    // Total inventory value
      weekSales: 45000,      // This week's sales
      totalBalance: 125000,  // Cash + Bank balance
      
      // Trend data (percentage change from last period)
      toCollectTrend: -5.2,    // Decreased by 5.2%
      toPayTrend: 8.1,         // Increased by 8.1%
      stockTrend: 2.3,         // Increased by 2.3%
      salesTrend: 12.5,        // Increased by 12.5%
      balanceTrend: 6.8,       // Increased by 6.8%
    };
  }

  static getSalesChartData() {
    return [
      { day: "Mon", sales: 8500 },
      { day: "Tue", sales: 12300 },
      { day: "Wed", sales: 9800 },
      { day: "Thu", sales: 15200 },
      { day: "Fri", sales: 18500 },
      { day: "Sat", sales: 22100 },
      { day: "Sun", sales: 14600 },
    ];
  }

  static getNotifications() {
    return [
      {
        id: 1,
        type: "warning",
        title: "Payment Overdue",
        message: "Invoice INV-2024-001 from Rajesh Kumar is 5 days overdue. Consider sending a reminder.",
        timestamp: "2 hours ago",
        actionLabel: "Send Reminder"
      },
      {
        id: 2,
        type: "info",
        title: "Low Stock Alert",
        message: "5 items are running low in stock. Reorder soon to avoid stockouts.",
        timestamp: "4 hours ago",
        actionLabel: "View Items"
      },
      {
        id: 3,
        type: "success",
        title: "Goal Achieved",
        message: "Congratulations! You've achieved 110% of your monthly sales target.",
        timestamp: "1 day ago",
        actionLabel: "View Report"
      },
      {
        id: 4,
        type: "error",
        title: "GST Filing Due",
        message: "GST return filing is due in 3 days. Ensure all invoices are updated.",
        timestamp: "2 days ago",
        actionLabel: "File GST"
      }
    ];
  }

  static getRecentTransactions() {
    return [
      {
        id: "TXN001",
        type: "Sale",
        reference: "INV-2024-001",
        customer: "Rajesh Kumar",
        date: "24-Jan",
        amount: 2500,
        status: "Paid",
      },
      {
        id: "TXN002",
        type: "Purchase",
        reference: "PUR-2024-015",
        supplier: "Wholesale Mart Ltd",
        date: "23-Jan",
        amount: 8500,
        status: "Pending",
      },
      {
        id: "TXN003",
        type: "Payment",
        reference: "PAY-2024-008",
        customer: "Sunita Electronics",
        date: "22-Jan",
        amount: 1200,
        status: "Received",
      },
      {
        id: "TXN004",
        type: "Sale",
        reference: "INV-2024-002",
        customer: "Amit Singh",
        date: "21-Jan",
        amount: 3750,
        status: "Pending",
      },
      {
        id: "TXN005",
        type: "Sale",
        reference: "INV-2024-003",
        customer: "Priya Sharma",
        date: "20-Jan",
        amount: 950,
        status: "Paid",
      },
      {
        id: "TXN006",
        type: "Purchase",
        reference: "PUR-2024-016",
        supplier: "Tech Solutions Pvt Ltd",
        date: "19-Jan",
        amount: 15000,
        status: "Overdue",
      },
      {
        id: "TXN007",
        type: "Sale",
        reference: "INV-2024-004",
        customer: "Mumbai Traders",
        date: "18-Jan",
        amount: 5200,
        status: "Paid",
      },
      {
        id: "TXN008",
        type: "Payment",
        reference: "PAY-2024-009",
        customer: "Delhi Electronics",
        date: "17-Jan",
        amount: 2800,
        status: "Received",
      },
    ];
  }

  static getReportShortcuts() {
    return [
      { 
        id: 1, 
        title: "Sales Reports", 
        icon: "📊", 
        color: "#10b981",
        description: "View sales analytics and trends"
      },
      { 
        id: 2, 
        title: "Inventory Reports", 
        icon: "📦", 
        color: "#f59e0b",
        description: "Stock and inventory analysis"
      },
      { 
        id: 3, 
        title: "GST Reports", 
        icon: "📋", 
        color: "#8b5cf6",
        description: "Tax and GST filings"
      },
      { 
        id: 4, 
        title: "Party Reports", 
        icon: "👥", 
        color: "#ef4444",
        description: "Customer and supplier reports"
      },
      { 
        id: 5, 
        title: "Profit & Loss", 
        icon: "💹", 
        color: "#06b6d4",
        description: "P&L statements and analysis"
      },
      { 
        id: 6, 
        title: "Cash Flow", 
        icon: "💰", 
        color: "#84cc16",
        description: "Cash flow statements"
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
        action: "CREATE_INVOICE"
      },
      {
        id: 2,
        title: "Receive Payment",
        icon: "💰",
        backgroundColor: "#3b82f6",
        action: "RECEIVE_PAYMENT"
      },
      {
        id: 3,
        title: "Quick Sale",
        icon: "🛒",
        backgroundColor: "#8b5cf6",
        action: "QUICK_SALE"
      },
      {
        id: 4,
        title: "Add Stock",
        icon: "📦",
        backgroundColor: "#f59e0b",
        action: "ADD_STOCK"
      },
      {
        id: 5,
        title: "Add Customer",
        icon: "👤",
        backgroundColor: "#ef4444",
        action: "ADD_CUSTOMER"
      },
      {
        id: 6,
        title: "Expenses",
        icon: "💳",
        backgroundColor: "#6366f1",
        action: "ADD_EXPENSE"
      },
    ];
  }

  // Business profile data
  static getBusinessProfile() {
    return {
      businessName: "Brojgar Store",
      ownerName: "Ram Kumar",
      businessType: "Retail",
      location: "New Delhi",
      registeredDate: "2023-01-15",
      gstNumber: "07ABCDE1234F1Z5",
      phone: "+91 98765 43210",
      email: "ramkumar@brojgarstore.com",
    };
  }

  // Method to handle quick actions
  static handleQuickAction(action) {
    console.log(`Handling action: ${action}`);
    // In a real app, this would navigate to appropriate screens
    switch (action) {
      case "CREATE_INVOICE":
        return { success: true, message: "Opening Invoice Creation Form..." };
      case "RECEIVE_PAYMENT":
        return { success: true, message: "Opening Payment Receipt Form..." };
      case "QUICK_SALE":
        return { success: true, message: "Opening Quick Sale Interface..." };
      case "ADD_STOCK":
        return { success: true, message: "Opening Stock Management..." };
      case "ADD_CUSTOMER":
        return { success: true, message: "Opening Customer Registration..." };
      case "ADD_EXPENSE":
        return { success: true, message: "Opening Expense Entry..." };
      default:
        return { success: false, message: "Unknown action" };
    }
  }

  static getDashboardSummary() {
    const kpi = this.getKPIData();
    const netPosition = kpi.toCollect - kpi.toPay;
    
    return {
      netPosition,
      statusMessage: netPosition > 0 
        ? "Your business is in a positive position" 
        : "You have more payables than receivables",
      cashFlow: kpi.totalBalance > 50000 
        ? "Healthy cash flow" 
        : "Monitor cash flow closely"
    };
  }

  // Additional utility methods
  static getTopCustomers() {
    return [
      { name: "Mumbai Traders", amount: 45000, transactions: 12 },
      { name: "Delhi Electronics", amount: 38500, transactions: 8 },
      { name: "Rajesh Kumar", amount: 25000, transactions: 15 },
      { name: "Sunita Electronics", amount: 22000, transactions: 6 },
      { name: "Amit Singh", amount: 18000, transactions: 9 },
    ];
  }

  static getTopProducts() {
    return [
      { name: "Product A", sold: 125, revenue: 25000 },
      { name: "Product B", sold: 98, revenue: 19600 },
      { name: "Product C", sold: 87, revenue: 17400 },
      { name: "Product D", sold: 76, revenue: 15200 },
      { name: "Product E", sold: 65, revenue: 13000 },
    ];
  }

  static getBusinessInsights() {
    return [
      {
        type: "positive",
        title: "Sales Growth",
        message: "Your sales have increased by 12.5% this week compared to last week.",
        suggestion: "Consider expanding your marketing efforts to maintain this growth."
      },
      {
        type: "warning",
        title: "Inventory Management",
        message: "5 products are running low in stock.",
        suggestion: "Review your inventory levels and place orders for fast-moving items."
      },
      {
        type: "info",
        title: "Customer Behavior",
        message: "Your top 5 customers contribute to 60% of your total revenue.",
        suggestion: "Consider loyalty programs for your top customers."
      }
    ];
  }
}

export default DashboardService;