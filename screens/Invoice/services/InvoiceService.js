// screens/Invoice/services/InvoiceService.js

class InvoiceService {
  constructor() {
    this.invoices = [
      {
        id: "1",
        invoiceNumber: "INV-001",
        date: "2024-01-15",
        dueDate: "2024-02-15",
        partyId: "1",
        partyName: "ABC Electronics",
        partyDetails: {
          name: "ABC Electronics",
          phone: "+91 98765 43210",
          email: "abc@electronics.com",
          address: "123 Market Street, Mumbai, Maharashtra 400001"
        },
        items: [
          {
            id: "1",
            name: "iPhone 15 Pro",
            quantity: 2,
            price: 125000,
            discount: 5000,
            unit: "pcs"
          }
        ],
        subtotal: 245000,
        taxRate: 18,
        taxAmount: 44100,
        total: 289100,
        notes: "Thank you for your business!",
        termsConditions: "Payment due within 30 days",
        status: "paid",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      }
    ];
    this.nextInvoiceId = 2;
  }

  // Get next invoice number
  async getNextInvoiceNumber() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextNumber = `INV-${String(this.nextInvoiceId).padStart(3, '0')}`;
        resolve(nextNumber);
      }, 100);
    });
  }

  // Create new invoice
  async createInvoice(invoiceData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newInvoice = {
            id: this.nextInvoiceId.toString(),
            ...invoiceData,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.invoices.push(newInvoice);
          this.nextInvoiceId++;

          resolve(newInvoice);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Get all invoices
  async getAllInvoices() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.invoices]);
      }, 300);
    });
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
          resolve({ ...invoice });
        } else {
          reject(new Error("Invoice not found"));
        }
      }, 200);
    });
  }

  // Update invoice
  async updateInvoice(id, updateData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
          this.invoices[index] = {
            ...this.invoices[index],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          resolve({ ...this.invoices[index] });
        } else {
          reject(new Error("Invoice not found"));
        }
      }, 300);
    });
  }

  // Delete invoice
  async deleteInvoice(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
          this.invoices.splice(index, 1);
          resolve(true);
        } else {
          reject(new Error("Invoice not found"));
        }
      }, 200);
    });
  }

  // Get invoice statistics
  getInvoiceStats() {
    const totalInvoices = this.invoices.length;
    const paidInvoices = this.invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = this.invoices.filter(inv => inv.status === 'pending').length;
    const overdueInvoices = this.invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return inv.status === 'pending' && dueDate < today;
    }).length;

    const totalRevenue = this.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingAmount = this.invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingAmount
    };
  }

  // Generate business info for invoice template
  getBusinessInfo() {
    return {
      businessName: "Your Business Name",
      address: "123 Business Street",
      city: "Your City, State 12345",
      phone: "+91 12345 67890",
      email: "business@example.com",
      website: "www.yourbusiness.com",
      gstNumber: "GST123456789",
      panNumber: "ABCDE1234F"
    };
  }

  // Format currency
  formatCurrency(amount) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  // Convert amount to words (for invoice template)
  convertAmountToWords(amount) {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    if (amount === 0) return 'Zero Rupees Only';

    let words = '';
    let scaleIndex = 0;

    while (amount > 0) {
      let chunk = amount % 1000;
      if (scaleIndex === 1) chunk = amount % 100; // For thousands in Indian system
      if (scaleIndex >= 2) chunk = amount % 100; // For lakhs and crores

      if (chunk !== 0) {
        let chunkWords = '';
        
        if (chunk >= 100) {
          chunkWords += ones[Math.floor(chunk / 100)] + ' Hundred ';
          chunk %= 100;
        }
        
        if (chunk >= 20) {
          chunkWords += tens[Math.floor(chunk / 10)] + ' ';
          chunk %= 10;
        }
        
        if (chunk > 0) {
          chunkWords += ones[chunk] + ' ';
        }
        
        words = chunkWords + scales[scaleIndex] + ' ' + words;
      }

      if (scaleIndex === 0) amount = Math.floor(amount / 1000);
      else if (scaleIndex === 1) amount = Math.floor(amount / 100);
      else amount = Math.floor(amount / 100);
      
      scaleIndex++;
    }

    return words.trim() + ' Rupees Only';
  }

  // Generate invoice PDF data (placeholder for future PDF generation)
  generateInvoicePDF(invoiceData) {
    return {
      success: true,
      message: "Invoice PDF generation would be implemented here",
      filePath: `/invoices/${invoiceData.invoiceNumber}.pdf`
    };
  }

  // Share invoice data
  getShareData(invoiceData) {
    const message = `Invoice ${invoiceData.invoiceNumber} for ₹${invoiceData.total.toLocaleString("en-IN")} from ${this.getBusinessInfo().businessName}`;
    return {
      title: `Invoice ${invoiceData.invoiceNumber}`,
      message: message,
      url: `https://yourbusiness.com/invoice/${invoiceData.id}`
    };
  }
}

export default new InvoiceService();