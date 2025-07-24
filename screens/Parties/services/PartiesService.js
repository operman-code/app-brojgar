// screens/Parties/services/PartiesService.js
import DatabaseService from '../../../database/DatabaseService';

class PartiesService {
  // Get all parties with optional filtering
  static async getAllParties(type = 'all', searchQuery = '') {
    try {
      await DatabaseService.init();
      
      let conditions = 'WHERE deleted_at IS NULL';
      let params = [];
      
      if (type !== 'all') {
        conditions += ' AND type = ?';
        params.push(type);
      }
      
      if (searchQuery) {
        conditions += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
        const searchPattern = `%${searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      conditions += ' ORDER BY name ASC';
      
      const parties = await DatabaseService.findAll('parties', conditions, params);
      
      return parties.map(party => ({
        id: party.id,
        name: party.name,
        type: party.type,
        phone: party.phone,
        email: party.email,
        balance: party.outstanding_balance || 0,
        status: party.is_active ? 'active' : 'inactive',
        address: party.address,
        gst_number: party.gst_number,
        created_at: party.created_at
      }));
    } catch (error) {
      console.error('❌ Error fetching parties:', error);
      return [];
    }
  }

  // Get party by ID
  static async getPartyById(id) {
    try {
      const party = await DatabaseService.findById('parties', id);
      if (!party || party.deleted_at) return null;
      
      return {
        id: party.id,
        name: party.name,
        type: party.type,
        phone: party.phone,
        email: party.email,
        gst_number: party.gst_number,
        pan_number: party.pan_number,
        address: party.address,
        city: party.city,
        state: party.state,
        pincode: party.pincode,
        country: party.country,
        outstanding_balance: party.outstanding_balance || 0,
        credit_limit: party.credit_limit || 0,
        credit_days: party.credit_days || 30,
        is_active: party.is_active,
        notes: party.notes,
        created_at: party.created_at
      };
    } catch (error) {
      console.error('❌ Error fetching party by ID:', error);
      return null;
    }
  }

  // Create new party
  static async createParty(partyData) {
    try {
      await DatabaseService.init();
      
      const data = {
        name: partyData.name,
        type: partyData.type || 'customer',
        phone: partyData.phone,
        email: partyData.email || null,
        gst_number: partyData.gst_number || null,
        pan_number: partyData.pan_number || null,
        address: partyData.address || null,
        city: partyData.city || null,
        state: partyData.state || null,
        pincode: partyData.pincode || null,
        country: partyData.country || 'India',
        outstanding_balance: 0,
        credit_limit: partyData.credit_limit || 0,
        credit_days: partyData.credit_days || 30,
        is_active: 1,
        notes: partyData.notes || null
      };
      
      const partyId = await DatabaseService.create('parties', data);
      
      // Create notification
      await this.createNotification('Party Added', `${data.name} has been added as a ${data.type}`, 'info');
      
      return partyId;
    } catch (error) {
      console.error('❌ Error creating party:', error);
      throw error;
    }
  }

  // Update party
  static async updateParty(id, partyData) {
    try {
      const updateData = {
        name: partyData.name,
        phone: partyData.phone,
        email: partyData.email || null,
        gst_number: partyData.gst_number || null,
        pan_number: partyData.pan_number || null,
        address: partyData.address || null,
        city: partyData.city || null,
        state: partyData.state || null,
        pincode: partyData.pincode || null,
        credit_limit: partyData.credit_limit || 0,
        credit_days: partyData.credit_days || 30,
        notes: partyData.notes || null
      };
      
      const result = await DatabaseService.update('parties', id, updateData);
      
      if (result > 0) {
        await this.createNotification('Party Updated', `${partyData.name} information has been updated`, 'info');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error updating party:', error);
      throw error;
    }
  }

  // Delete party (soft delete)
  static async deleteParty(id) {
    try {
      const party = await this.getPartyById(id);
      if (!party) throw new Error('Party not found');
      
      const result = await DatabaseService.softDelete('parties', id);
      
      if (result > 0) {
        await this.createNotification('Party Removed', `${party.name} has been removed`, 'warning');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting party:', error);
      throw error;
    }
  }

  // Get parties summary
  static async getPartiesSummary() {
    try {
      const [customers, suppliers, totalBalance] = await Promise.all([
        this.getCustomersCount(),
        this.getSuppliersCount(),
        this.getTotalOutstanding()
      ]);
      
      return {
        totalCustomers: customers,
        totalSuppliers: suppliers,
        totalParties: customers + suppliers,
        totalOutstanding: totalBalance.receivable,
        totalPayable: totalBalance.payable
      };
    } catch (error) {
      console.error('❌ Error getting parties summary:', error);
      return {
        totalCustomers: 0,
        totalSuppliers: 0,
        totalParties: 0,
        totalOutstanding: 0,
        totalPayable: 0
      };
    }
  }

  // Get customers count
  static async getCustomersCount() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE type = 'customer' AND deleted_at IS NULL
      `);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting customers count:', error);
      return 0;
    }
  }

  // Get suppliers count
  static async getSuppliersCount() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE type = 'supplier' AND deleted_at IS NULL
      `);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting suppliers count:', error);
      return 0;
    }
  }

  // Get total outstanding balances
  static async getTotalOutstanding() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT 
          SUM(CASE WHEN type = 'customer' AND outstanding_balance > 0 THEN outstanding_balance ELSE 0 END) as receivable,
          SUM(CASE WHEN type = 'supplier' AND outstanding_balance > 0 THEN outstanding_balance ELSE 0 END) as payable
        FROM parties 
        WHERE deleted_at IS NULL
      `);
      
      return {
        receivable: result[0]?.receivable || 0,
        payable: result[0]?.payable || 0
      };
    } catch (error) {
      console.error('❌ Error getting outstanding balances:', error);
      return { receivable: 0, payable: 0 };
    }
  }

  // Get top customers by sales
  static async getTopCustomers(limit = 5) {
    try {
      const customers = await DatabaseService.executeQuery(`
        SELECT 
          p.id,
          p.name,
          p.phone,
          p.outstanding_balance,
          COALESCE(SUM(i.total), 0) as total_sales,
          COUNT(i.id) as invoice_count
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.deleted_at IS NULL
        WHERE p.type = 'customer' AND p.deleted_at IS NULL
        GROUP BY p.id, p.name, p.phone, p.outstanding_balance
        ORDER BY total_sales DESC
        LIMIT ?
      `, [limit]);
      
      return customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalSales: customer.total_sales,
        invoiceCount: customer.invoice_count,
        balance: customer.outstanding_balance
      }));
    } catch (error) {
      console.error('❌ Error getting top customers:', error);
      return [];
    }
  }

  // Update party balance
  static async updatePartyBalance(partyId, amount, type = 'add') {
    try {
      const party = await this.getPartyById(partyId);
      if (!party) throw new Error('Party not found');
      
      const newBalance = type === 'add' 
        ? party.outstanding_balance + amount 
        : party.outstanding_balance - amount;
      
      const result = await DatabaseService.update('parties', partyId, {
        outstanding_balance: newBalance
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error updating party balance:', error);
      throw error;
    }
  }

  // Search parties
  static async searchParties(query, type = 'all') {
    try {
      if (!query || query.trim().length < 2) {
        return await this.getAllParties(type);
      }
      
      return await this.getAllParties(type, query.trim());
    } catch (error) {
      console.error('❌ Error searching parties:', error);
      return [];
    }
  }

  // Get party transactions
  static async getPartyTransactions(partyId, limit = 10) {
    try {
      const transactions = await DatabaseService.executeQuery(`
        SELECT 
          i.id,
          i.invoice_number,
          i.invoice_date,
          i.total,
          i.status,
          'invoice' as type
        FROM invoices i
        WHERE i.party_id = ? AND i.deleted_at IS NULL
        
        UNION ALL
        
        SELECT 
          p.id,
          CONCAT('PAY-', p.id) as reference,
          p.payment_date,
          p.amount,
          'received' as status,
          'payment' as type
        FROM payments p
        WHERE p.party_id = ?
        
        ORDER BY invoice_date DESC
        LIMIT ?
      `, [partyId, partyId, limit]);
      
      return transactions.map(t => ({
        id: t.id,
        reference: t.invoice_number || t.reference,
        date: t.invoice_date,
        amount: t.total || t.amount,
        status: t.status,
        type: t.type
      }));
    } catch (error) {
      console.error('❌ Error getting party transactions:', error);
      return [];
    }
  }

  // Create notification
  static async createNotification(title, message, type = 'info', priority = 'medium') {
    try {
      await DatabaseService.create('notifications', {
        title,
        message,
        type,
        priority,
        read: 0
      });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  // Utility functions
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  static formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  static validatePartyData(data) {
    const errors = {};
    
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (data.email && !this.validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (data.gst_number && !this.validateGST(data.gst_number)) {
      errors.gst_number = 'Please enter a valid GST number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateGST(gstNumber) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  }
}

export default PartiesService;