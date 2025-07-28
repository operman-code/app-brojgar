// screens/Parties/services/PartiesService.js
import DatabaseService from '../../../database/DatabaseService';

class PartiesService {
  // Get all parties
  static async getAllParties() {
    try {
      const query = `
        SELECT 
          id,
          name,
          phone,
          email,
          address,
          gst_number,
          pan_number,
          type,
          credit_limit,
          credit_days,
          opening_balance,
          balance,
          notes,
          created_at,
          updated_at
        FROM parties 
        WHERE deleted_at IS NULL
        ORDER BY name ASC
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result || [];
    } catch (error) {
      console.error('❌ Error fetching parties:', error);
      return [];
    }
  }

  // Create new party
  static async createParty(partyData) {
    try {
      const query = `
        INSERT INTO parties (
          name, phone, email, address, gst_number, pan_number, 
          type, credit_limit, credit_days, opening_balance, balance, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        partyData.name,
        partyData.phone || '',
        partyData.email || '',
        partyData.address || '',
        partyData.gstNumber || '',
        partyData.panNumber || '',
        partyData.type || 'customer',
        parseFloat(partyData.creditLimit || 0),
        parseInt(partyData.creditDays || 30),
        parseFloat(partyData.openingBalance || 0),
        parseFloat(partyData.openingBalance || 0), // balance = opening_balance initially
        partyData.notes || ''
      ];
      
      const result = await DatabaseService.executeQuery(query, params);
      console.log('✅ Party created successfully');
      return result;
    } catch (error) {
      console.error('❌ Error creating party:', error);
      throw error;
    }
  }

  // Add party (alias for createParty)
  static async addParty(partyData) {
    return this.createParty(partyData);
  }

  // Update party
  static async updateParty(partyId, partyData) {
    try {
      const query = `
        UPDATE parties 
        SET 
          name = ?, 
          phone = ?, 
          email = ?, 
          address = ?, 
          gst_number = ?, 
          pan_number = ?,
          type = ?, 
          credit_limit = ?, 
          credit_days = ?, 
          opening_balance = ?, 
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const params = [
        partyData.name,
        partyData.phone || '',
        partyData.email || '',
        partyData.address || '',
        partyData.gstNumber || '',
        partyData.panNumber || '',
        partyData.type || 'customer',
        parseFloat(partyData.creditLimit || 0),
        parseInt(partyData.creditDays || 30),
        parseFloat(partyData.openingBalance || 0),
        partyData.notes || '',
        partyId
      ];
      
      const result = await DatabaseService.executeQuery(query, params);
      console.log('✅ Party updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating party:', error);
      throw error;
    }
  }

  // Delete party (soft delete)
  static async deleteParty(partyId) {
    try {
      const query = `
        UPDATE parties 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [partyId]);
      console.log('✅ Party deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error deleting party:', error);
      throw error;
    }
  }

  // Get party by ID
  static async getPartyById(partyId) {
    try {
      const query = `
        SELECT * FROM parties 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [partyId]);
      return result[0] || null;
    } catch (error) {
      console.error('❌ Error fetching party by ID:', error);
      return null;
    }
  }

  // Get customers only
  static async getCustomers() {
    try {
      const query = `
        SELECT * FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'customer' OR type = 'both')
        ORDER BY name ASC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      return [];
    }
  }

  // Get suppliers only
  static async getSuppliers() {
    try {
      const query = `
        SELECT * FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'supplier' OR type = 'both')
        ORDER BY name ASC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      return [];
    }
  }

  // Get parties summary
  static async getPartiesSummary() {
    try {
      const [totalCustomers, totalSuppliers, totalReceivables, totalPayables] = await Promise.all([
        this.getTotalCustomers(),
        this.getTotalSuppliers(),
        this.getTotalReceivables(),
        this.getTotalPayables()
      ]);

      return {
        totalCustomers,
        totalSuppliers,
        totalReceivables,
        totalPayables
      };
    } catch (error) {
      console.error('❌ Error getting parties summary:', error);
      return {
        totalCustomers: 0,
        totalSuppliers: 0,
        totalReceivables: 0,
        totalPayables: 0
      };
    }
  }

  // Get parties statistics  
  static async getPartiesStatistics() {
    return this.getPartiesSummary();
  }

  // Get total customers count
  static async getTotalCustomers() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'customer' OR type = 'both')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total customers:', error);
      return 0;
    }
  }

  // Get total suppliers count
  static async getTotalSuppliers() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'supplier' OR type = 'both')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total suppliers:', error);
      return 0;
    }
  }

  // Get total receivables
  static async getTotalReceivables() {
    try {
      const query = `
        SELECT COALESCE(SUM(balance), 0) as total 
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'customer' OR type = 'both')
          AND balance > 0
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total || 0;
    } catch (error) {
      console.error('❌ Error getting total receivables:', error);
      return 0;
    }
  }

  // Get total payables
  static async getTotalPayables() {
    try {
      const query = `
        SELECT COALESCE(SUM(ABS(balance)), 0) as total 
        FROM parties 
        WHERE deleted_at IS NULL 
          AND (type = 'supplier' OR type = 'both')
          AND balance < 0
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total || 0;
    } catch (error) {
      console.error('❌ Error getting total payables:', error);
      return 0;
    }
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate GST number format
  static isValidGSTNumber(gstNumber) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
  }

  // Search parties
  static async searchParties(searchQuery) {
    try {
      const query = `
        SELECT * FROM parties 
        WHERE deleted_at IS NULL 
          AND (
            name LIKE ? OR 
            phone LIKE ? OR 
            email LIKE ? OR
            gst_number LIKE ?
          )
        ORDER BY name ASC
      `;
      
      const searchTerm = `%${searchQuery}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(query, params);
    } catch (error) {
      console.error('❌ Error searching parties:', error);
      return [];
    }
  }

  // Update party balance
  static async updatePartyBalance(partyId, newBalance) {
    try {
      const query = `
        UPDATE parties 
        SET 
          balance = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [newBalance, partyId]);
      console.log('✅ Party balance updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating party balance:', error);
      throw error;
    }
  }
}

export default PartiesService;
