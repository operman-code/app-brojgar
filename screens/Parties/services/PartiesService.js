// screens/Parties/services/PartiesService.js
class PartiesService {
  static parties = [
    {
      id: "1",
      name: "Rajesh Electronics",
      phone: "+91 98765 43210",
      email: "rajesh@electronics.com",
      address: "Shop 45, Electronics Market, Lajpat Nagar, New Delhi - 110024",
      gstNumber: "07ABCDE1234F1Z5",
      type: "customer",
      creditLimit: "50000",
      paymentTerms: "Net 30 days",
      notes: "Regular customer with good payment history",
      createdAt: "2024-01-15T10:30:00Z",
      balance: 25000, // Positive means they owe us
    },
    {
      id: "2",
      name: "Global Tech Distributors",
      phone: "+91 99887 76543",
      email: "purchase@globaltech.com",
      address: "Block B, Industrial Area, Phase 2, Gurgaon, Haryana - 122016",
      gstNumber: "06FGHIJ5678K9L0",
      type: "supplier",
      creditLimit: "200000",
      paymentTerms: "Net 15 days",
      notes: "Primary supplier for electronic components",
      createdAt: "2023-12-10T14:20:00Z",
      balance: -75000, // Negative means we owe them
    },
    {
      id: "3",
      name: "Delhi Mobile Store",
      phone: "+91 98888 12345",
      email: "info@delhimobile.com",
      address: "Karol Bagh Market, New Delhi - 110005",
      gstNumber: "07MNOPQ9876R5S4",
      type: "customer",
      creditLimit: "30000",
      paymentTerms: "Cash on delivery",
      notes: "Bulk buyer of mobile accessories",
      createdAt: "2024-01-20T09:15:00Z",
      balance: 15000,
    },
    {
      id: "4",
      name: "Mumbai Electronics Hub",
      phone: "+91 97777 54321",
      email: "orders@mumbaielectronics.com",
      address: "Lamington Road, Mumbai, Maharashtra - 400007",
      gstNumber: "27TUVWX3456Y7Z8",
      type: "customer",
      creditLimit: "75000",
      paymentTerms: "Net 45 days",
      notes: "Large volume customer from Mumbai",
      createdAt: "2023-11-25T16:45:00Z",
      balance: 45000,
    },
    {
      id: "5",
      name: "Wholesale Electronics Ltd",
      phone: "+91 96666 67890",
      email: "sales@wholesaleelectronics.in",
      address: "Electronic City, Bangalore, Karnataka - 560100",
      gstNumber: "29ABCDE7890F1G2",
      type: "supplier",
      creditLimit: "150000",
      paymentTerms: "Net 20 days",
      notes: "Competitive pricing for bulk orders",
      createdAt: "2023-10-05T11:30:00Z",
      balance: -35000,
    },
    {
      id: "6",
      name: "Priya Mobile Center",
      phone: "+91 95555 11111",
      email: "priya@mobilecenter.com",
      address: "Nehru Place, New Delhi - 110019",
      gstNumber: "07HIJKL2345M6N7",
      type: "customer",
      creditLimit: "25000",
      paymentTerms: "Net 15 days",
      notes: "Specializes in mobile repairs and accessories",
      createdAt: "2024-01-10T13:20:00Z",
      balance: 8500,
    },
    {
      id: "7",
      name: "Tech Solutions Pvt Ltd",
      phone: "+91 94444 22222",
      email: "procurement@techsolutions.co.in",
      address: "Cyber City, Gurgaon, Haryana - 122002",
      gstNumber: "06OPQRS6789T0U1",
      type: "customer",
      creditLimit: "100000",
      paymentTerms: "Net 60 days",
      notes: "Corporate client with regular large orders",
      createdAt: "2023-09-20T08:45:00Z",
      balance: 85000,
    },
    {
      id: "8",
      name: "Chennai Electronics",
      phone: "+91 93333 33333",
      email: "buy@chennaielectronics.com",
      address: "Ritchie Street, Chennai, Tamil Nadu - 600002",
      gstNumber: "33VWXYZ1234A5B6",
      type: "customer",
      creditLimit: "40000",
      paymentTerms: "Net 30 days",
      notes: "South India distributor",
      createdAt: "2023-12-15T15:30:00Z",
      balance: 22000,
    },
    {
      id: "9",
      name: "National Electronics",
      phone: "+91 92222 44444",
      email: "supply@nationalelectronics.in",
      address: "Industrial Estate, Faridabad, Haryana - 121003",
      gstNumber: "06CDEFG8901H2I3",
      type: "supplier",
      creditLimit: "300000",
      paymentTerms: "Net 30 days",
      notes: "Largest supplier with best warranty terms",
      createdAt: "2023-08-10T12:00:00Z",
      balance: -120000,
    },
    {
      id: "10",
      name: "Bangalore Tech Store",
      phone: "+91 91111 55555",
      email: "info@bangaloretech.com",
      address: "Commercial Street, Bangalore, Karnataka - 560001",
      gstNumber: "29JKLMN4567O8P9",
      type: "customer",
      creditLimit: "60000",
      paymentTerms: "Net 30 days",
      notes: "Growing customer base in Bangalore",
      createdAt: "2024-01-05T10:15:00Z",
      balance: 32000,
    },
  ];

  // Get all parties
  static async getAllParties() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.parties]);
      }, 300);
    });
  }

  // Get party by ID
  static async getPartyById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const party = this.parties.find(p => p.id === id);
        if (party) {
          resolve({ ...party });
        } else {
          reject(new Error("Party not found"));
        }
      }, 200);
    });
  }

  // Add new party
  static async addParty(partyData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newParty = {
            ...partyData,
            id: (this.parties.length + 1).toString(),
            createdAt: new Date().toISOString(),
            balance: 0,
          };
          this.parties.push(newParty);
          resolve(newParty);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Update existing party
  static async updateParty(id, partyData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.parties.findIndex(p => p.id === id);
          if (index !== -1) {
            this.parties[index] = {
              ...this.parties[index],
              ...partyData,
              id, // Ensure ID doesn't change
            };
            resolve(this.parties[index]);
          } else {
            reject(new Error("Party not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Delete party
  static async deleteParty(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.parties.findIndex(p => p.id === id);
          if (index !== -1) {
            const deletedParty = this.parties.splice(index, 1)[0];
            resolve(deletedParty);
          } else {
            reject(new Error("Party not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  }

  // Get parties by type
  static async getPartiesByType(type) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.parties.filter(p => p.type === type);
        resolve(filtered);
      }, 200);
    });
  }

  // Search parties
  static async searchParties(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve([...this.parties]);
          return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.parties.filter(party =>
          party.name.toLowerCase().includes(searchTerm) ||
          party.phone.includes(searchTerm) ||
          party.email.toLowerCase().includes(searchTerm) ||
          party.gstNumber.toLowerCase().includes(searchTerm) ||
          party.address.toLowerCase().includes(searchTerm)
        );
        resolve(filtered);
      }, 300);
    });
  }

  // Get party balance
  static getPartyBalance(partyId) {
    const party = this.parties.find(p => p.id === partyId);
    return party ? party.balance : 0;
  }

  // Update party balance
  static async updatePartyBalance(partyId, amount, operation = 'add') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const party = this.parties.find(p => p.id === partyId);
          if (party) {
            if (operation === 'add') {
              party.balance += amount;
            } else if (operation === 'subtract') {
              party.balance -= amount;
            } else if (operation === 'set') {
              party.balance = amount;
            }
            resolve(party);
          } else {
            reject(new Error("Party not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }

  // Get party statistics
  static getPartiesStatistics() {
    const customers = this.parties.filter(p => p.type === 'customer');
    const suppliers = this.parties.filter(p => p.type === 'supplier');
    
    const totalReceivables = customers.reduce((sum, party) => {
      return sum + (party.balance > 0 ? party.balance : 0);
    }, 0);
    
    const totalPayables = suppliers.reduce((sum, party) => {
      return sum + (party.balance < 0 ? Math.abs(party.balance) : 0);
    }, 0);

    return {
      totalParties: this.parties.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalReceivables,
      totalPayables,
      netPosition: totalReceivables - totalPayables,
      averageCustomerBalance: customers.length > 0 ? 
        customers.reduce((sum, c) => sum + c.balance, 0) / customers.length : 0,
      averageSupplierBalance: suppliers.length > 0 ? 
        suppliers.reduce((sum, s) => sum + Math.abs(s.balance), 0) / suppliers.length : 0,
    };
  }

  // Get top customers by balance
  static getTopCustomers(limit = 5) {
    return this.parties
      .filter(p => p.type === 'customer')
      .sort((a, b) => b.balance - a.balance)
      .slice(0, limit);
  }

  // Get top suppliers by balance
  static getTopSuppliers(limit = 5) {
    return this.parties
      .filter(p => p.type === 'supplier')
      .sort((a, b) => a.balance - b.balance) // Most owed (most negative)
      .slice(0, limit);
  }

  // Get parties with overdue balances
  static getOverdueParties() {
    // In a real app, this would check due dates from transactions
    return this.parties.filter(p => p.balance > 50000 || p.balance < -50000);
  }

  // Validate party data
  static validatePartyData(partyData) {
    const errors = [];

    if (!partyData.name || partyData.name.trim() === '') {
      errors.push('Party name is required');
    }

    if (!partyData.phone || partyData.phone.trim() === '') {
      errors.push('Phone number is required');
    }

    if (partyData.email && !this.isValidEmail(partyData.email)) {
      errors.push('Invalid email format');
    }

    if (partyData.gstNumber && !this.isValidGSTNumber(partyData.gstNumber)) {
      errors.push('Invalid GST number format');
    }

    if (partyData.creditLimit && isNaN(Number(partyData.creditLimit))) {
      errors.push('Credit limit must be a valid number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // GST number validation
  static isValidGSTNumber(gstNumber) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  }

  // Export parties data
  static exportParties(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.parties, null, 2);
    } else if (format === 'csv') {
      const headers = ['ID', 'Name', 'Phone', 'Email', 'Type', 'GST Number', 'Balance', 'Created Date'];
      const csvData = this.parties.map(party => [
        party.id,
        party.name,
        party.phone,
        party.email,
        party.type,
        party.gstNumber,
        party.balance,
        new Date(party.createdAt).toLocaleDateString()
      ]);
      
      return [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    }
    return '';
  }

  // Import parties data
  static async importParties(partiesData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (Array.isArray(partiesData)) {
            const validParties = [];
            const errors = [];

            partiesData.forEach((party, index) => {
              const validation = this.validatePartyData(party);
              if (validation.isValid) {
                const newParty = {
                  ...party,
                  id: (this.parties.length + validParties.length + 1).toString(),
                  createdAt: party.createdAt || new Date().toISOString(),
                  balance: party.balance || 0,
                };
                validParties.push(newParty);
              } else {
                errors.push({
                  index,
                  errors: validation.errors
                });
              }
            });

            this.parties.push(...validParties);
            resolve({
              imported: validParties.length,
              errors: errors.length,
              errorDetails: errors
            });
          } else {
            reject(new Error('Invalid data format'));
          }
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Get recent parties (last 30 days)
  static getRecentParties(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.parties.filter(party => {
      const createdDate = new Date(party.createdAt);
      return createdDate >= cutoffDate;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Format currency
  static formatCurrency(amount) {
    return `₹${Math.abs(amount).toLocaleString("en-IN")}`;
  }

  // Get party summary for dashboard
  static getPartiesSummary() {
    const stats = this.getPartiesStatistics();
    const recentParties = this.getRecentParties(7);
    const overdueParties = this.getOverdueParties();

    return {
      totalParties: stats.totalParties,
      totalCustomers: stats.totalCustomers,
      totalSuppliers: stats.totalSuppliers,
      totalReceivables: this.formatCurrency(stats.totalReceivables),
      totalPayables: this.formatCurrency(stats.totalPayables),
      netPosition: stats.netPosition,
      recentPartiesCount: recentParties.length,
      overduePartiesCount: overdueParties.length,
      topCustomer: this.getTopCustomers(1)[0] || null,
      topSupplier: this.getTopSuppliers(1)[0] || null,
    };
  }
}

export default PartiesService;