// Service to manage dashboard data
class DashboardService {
  // Mock data that simulates real business data
  static getKPIData() {
    return {
      toCollect: 25000,      // Outstanding receivables
      toPay: 12500,          // Outstanding payables
      stockValue: 185000,    // Total inventory value
      weekSales: 45000,      // This week's sales
      totalBalance: 125000,  // Cash + Bank balance
    };
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
    ];
  }

  static getReportShortcuts() {
    return [
      { 
        id: 1, 
        title: "Sales Reports", 
        icon: "📊", 
        color: "#10b981",
        description: "View sales analytics"
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
        title: "Received Payment",
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
    };
  }

  // Method to handle quick actions
  static handleQuickAction(action) {
    console.log(`Handling action: ${action}`);
    // In a real app, this would navigate to appropriate screens
    switch (action) {
      case "CREATE_INVOICE":
        return { success: true, message: "Navigating to Invoice Creation" };
      case "RECEIVE_PAYMENT":
        return { success: true, message: "Navigating to Payment Receipt" };
      case "QUICK_SALE":
        return { success: true, message: "Navigating to Quick Sale" };
      case "ADD_STOCK":
        return { success: true, message: "Navigating to Stock Management" };
      default:
        return { success: false, message: "Unknown action" };
    }
  }

  // Method to get dashboard summary text
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
}

export default DashboardService;