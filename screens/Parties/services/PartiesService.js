// screens/Parties/services/PartiesService.js
import DatabaseService from '../../../database/DatabaseService';

class PartiesService {
  // Get all parties from database
  static async getAllParties() {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        SELECT * FROM parties 
        WHERE is_active = 1 
        ORDER BY name ASC
      `;
      const result = await db.getAllAsync(query);
      return result.map(party => ({
        ...party,
        id: party.id.toString(),
        balance: party.current_balance || 0,
        creditLimit: party.credit_limit?.toString() || "0",
        paymentTerms: `Net ${party.credit_days || 30} days`,
        address: this.buildFullAddress(party),
        gstNumber: party.gst_number || "",
        panNumber: party.pan_number || ""
      }));
    } catch (error) {
      console.error('❌ Error fetching parties:', error);
      return [];
    }
  }

  // Add new party to database
  static async addParty(partyData) {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        INSERT INTO parties (
          name, type, email, phone, gst_number, pan_number,
          address_line1, address_line2, city, state, pincode, country,
          opening_balance, current_balance, credit_limit, credit_days, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Parse address if it's a single string
      const addressParts = this.parseAddress(partyData.address || "");
      
      const result = await db.runAsync(query, [
        partyData.name,
        partyData.type || 'customer',
        partyData.email || '',
        partyData.phone || '',
        partyData.gstNumber || '',
        partyData.panNumber || '',
        addressParts.line1 || '',
        addressParts.line2 || '',
        addressParts.city || '',
        addressParts.state || '',
        addressParts.pincode || '',
        addressParts.country || 'India',
        partyData.openingBalance || 0,
        partyData.openingBalance || 0, // current_balance starts as opening_balance
        partyData.creditLimit || 0,
        partyData.creditDays || 30,
        partyData.notes || ''
      ]);

      console.log('✅ Party added successfully:', partyData.name);
      return {
        success: true,
        id: result.lastInsertRowId,
        message: 'Party added successfully'
      };
    } catch (error) {
      console.error('❌ Error adding party:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update existing party
  static async updateParty(id, partyData) {
    try {
      const db = await DatabaseService.getDatabase();
      const addressParts = this.parseAddress(partyData.address || "");
      
      const query = `
        UPDATE parties SET
          name = ?, type = ?, email = ?, phone = ?, 
          gst_number = ?, pan_number = ?,
          address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?,
          credit_limit = ?, credit_days = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await db.runAsync(query, [
        partyData.name,
        partyData.type || 'customer',
        partyData.email || '',
        partyData.phone || '',
        partyData.gstNumber || '',
        partyData.panNumber || '',
        addressParts.line1 || '',
        addressParts.line2 || '',
        addressParts.city || '',
        addressParts.state || '',
        addressParts.pincode || '',
        partyData.creditLimit || 0,
        partyData.creditDays || 30,
        partyData.notes || '',
        id
      ]);

      console.log('✅ Party updated successfully:', id);
      return {
        success: true,
        message: 'Party updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating party:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete party (soft delete)
  static async deleteParty(id) {
    try {
      const db = await DatabaseService.getDatabase();
      await db.runAsync(`
        UPDATE parties 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);

      console.log('✅ Party deleted successfully:', id);
      return {
        success: true,
        message: 'Party deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting party:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search parties
  static async searchParties(searchTerm) {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        SELECT * FROM parties 
        WHERE is_active = 1 
        AND (
          name LIKE ? OR
          phone LIKE ? OR
          email LIKE ? OR
          gst_number LIKE ?
        )
        ORDER BY name ASC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const result = await db.getAllAsync(query, [
        searchPattern, searchPattern, searchPattern, searchPattern
      ]);
      
      return result.map(party => ({
        ...party,
        id: party.id.toString(),
        balance: party.current_balance || 0,
        creditLimit: party.credit_limit?.toString() || "0",
        address: this.buildFullAddress(party),
        gstNumber: party.gst_number || "",
        panNumber: party.pan_number || ""
      }));
    } catch (error) {
      console.error('❌ Error searching parties:', error);
      return [];
    }
  }

  // Get parties by type
  static async getPartiesByType(type) {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        SELECT * FROM parties 
        WHERE is_active = 1 AND (type = ? OR type = 'both')
        ORDER BY name ASC
      `;
      
      const result = await db.getAllAsync(query, [type]);
      return result.map(party => ({
        ...party,
        id: party.id.toString(),
        balance: party.current_balance || 0,
        creditLimit: party.credit_limit?.toString() || "0",
        address: this.buildFullAddress(party),
        gstNumber: party.gst_number || "",
        panNumber: party.pan_number || ""
      }));
    } catch (error) {
      console.error('❌ Error fetching parties by type:', error);
      return [];
    }
  }

  // Get parties statistics
  static async getPartiesStatistics() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const [
        totalCustomers,
        totalSuppliers,
        totalReceivables,
        totalPayables
      ] = await Promise.all([
        db.getFirstAsync(`
          SELECT COUNT(*) as count FROM parties 
          WHERE is_active = 1 AND type IN ('customer', 'both')
        `),
        db.getFirstAsync(`
          SELECT COUNT(*) as count FROM parties 
          WHERE is_active = 1 AND type IN ('supplier', 'both')
        `),
        db.getFirstAsync(`
          SELECT COALESCE(SUM(current_balance), 0) as total FROM parties 
          WHERE is_active = 1 AND type IN ('customer', 'both') AND current_balance > 0
        `),
        db.getFirstAsync(`
          SELECT COALESCE(SUM(ABS(current_balance)), 0) as total FROM parties 
          WHERE is_active = 1 AND type IN ('supplier', 'both') AND current_balance < 0
        `)
      ]);

      return {
        totalCustomers: totalCustomers?.count || 0,
        totalSuppliers: totalSuppliers?.count || 0,
        totalReceivables: totalReceivables?.total || 0,
        totalPayables: totalPayables?.total || 0,
        totalParties: (totalCustomers?.count || 0) + (totalSuppliers?.count || 0)
      };
    } catch (error) {
      console.error('❌ Error getting parties statistics:', error);
      return {
        totalCustomers: 0,
        totalSuppliers: 0,
        totalReceivables: 0,
        totalPayables: 0,
        totalParties: 0
      };
    }
  }

  // Update party balance
  static async updatePartyBalance(partyId, amount, type = 'debit') {
    try {
      const db = await DatabaseService.getDatabase();
      
      const updateQuery = type === 'debit' 
        ? 'UPDATE parties SET current_balance = current_balance + ? WHERE id = ?'
        : 'UPDATE parties SET current_balance = current_balance - ? WHERE id = ?';
      
      await db.runAsync(updateQuery, [amount, partyId]);
      
      console.log('✅ Party balance updated:', partyId, type, amount);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating party balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to parse address string into components
  static parseAddress(addressString) {
    if (!addressString) {
      return {
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      };
    }

    // Simple address parsing - in production, you might want more sophisticated parsing
    const parts = addressString.split(',').map(part => part.trim());
    
    return {
      line1: parts[0] || '',
      line2: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      pincode: parts[4] || '',
      country: parts[5] || 'India'
    };
  }

  // Helper function to build full address from party object
  static buildFullAddress(party) {
    const parts = [
      party.address_line1,
      party.address_line2,
      party.city,
      party.state,
      party.pincode
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  }

  // Get party by ID
  static async getPartyById(id) {
    try {
      const db = await DatabaseService.getDatabase();
      const party = await db.getFirstAsync('SELECT * FROM parties WHERE id = ?', [id]);
      
      if (!party) {
        throw new Error('Party not found');
      }
      
      return {
        ...party,
        id: party.id.toString(),
        balance: party.current_balance || 0,
        creditLimit: party.credit_limit?.toString() || "0",
        address: this.buildFullAddress(party),
        gstNumber: party.gst_number || "",
        panNumber: party.pan_number || ""
      };
    } catch (error) {
      console.error('❌ Error fetching party by ID:', error);
      throw error;
    }
  }

  // Get top customers by revenue
  static async getTopCustomers(limit = 10) {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        SELECT 
          p.*,
          COALESCE(SUM(i.total_amount), 0) as total_revenue,
          COUNT(i.id) as total_invoices
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.status != 'cancelled'
        WHERE p.is_active = 1 AND p.type IN ('customer', 'both')
        GROUP BY p.id
        ORDER BY total_revenue DESC
        LIMIT ?
      `;
      
      const result = await db.getAllAsync(query, [limit]);
      return result.map(party => ({
        ...party,
        id: party.id.toString(),
        totalRevenue: party.total_revenue || 0,
        totalInvoices: party.total_invoices || 0,
        address: this.buildFullAddress(party)
      }));
    } catch (error) {
      console.error('❌ Error fetching top customers:', error);
      return [];
    }
  }

  // Get customers with outstanding balances
  static async getOutstandingCustomers(limit = 10) {
    try {
      const db = await DatabaseService.getDatabase();
      const query = `
        SELECT 
          p.*,
          COALESCE(SUM(i.balance_amount), 0) as outstanding_amount
        FROM parties p
        LEFT JOIN invoices i ON p.id = i.party_id AND i.balance_amount > 0
        WHERE p.is_active = 1 AND p.type IN ('customer', 'both')
        GROUP BY p.id
        HAVING outstanding_amount > 0
        ORDER BY outstanding_amount DESC
        LIMIT ?
      `;
      
      const result = await db.getAllAsync(query, [limit]);
      return result.map(party => ({
        ...party,
        id: party.id.toString(),
        outstandingAmount: party.outstanding_amount || 0,
        address: this.buildFullAddress(party)
      }));
    } catch (error) {
      console.error('❌ Error fetching outstanding customers:', error);
      return [];
    }
  }
}

export default PartiesService;
