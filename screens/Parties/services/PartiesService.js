// screens/Parties/services/PartiesService.js
import DatabaseService from '../../../database/DatabaseService';

class PartiesService {
  // Get all parties with optional filtering
  static async getAllParties(type = null, searchQuery = '') {
    try {
      await DatabaseService.init();
      
      let query = `
        SELECT * FROM parties 
        WHERE (deleted_at IS NULL OR deleted_at = '')
      `;
      let params = [];
      
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }
      
      if (searchQuery) {
        query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await DatabaseService.executeQuery(query, params);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error fetching parties:', error);
      return [];
    }
  }

  // Create new party
  static async createParty(partyData) {
    try {
      await DatabaseService.init();
      
      const {
        name,
        type = 'Customer',
        phone = '',
        email = '',
        address = '',
        gst_number = '',
        pan_number = ''
      } = partyData;
      
      const query = `
        INSERT INTO parties (
          name, type, phone, email, address, gst_number, pan_number,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = await DatabaseService.executeQuery(query, [
        name, type, phone, email, address, gst_number, pan_number
      ]);
      
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error creating party:', error);
      return { success: false, error: error.message };
    }
  }

  // Update party
  static async updateParty(id, partyData) {
    try {
      await DatabaseService.init();
      
      const {
        name,
        type,
        phone,
        email,
        address,
        gst_number,
        pan_number
      } = partyData;
      
      const query = `
        UPDATE parties 
        SET name = ?, type = ?, phone = ?, email = ?, address = ?, 
            gst_number = ?, pan_number = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [
        name, type, phone, email, address, gst_number, pan_number, id
      ]);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating party:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete party (soft delete)
  static async deleteParty(id) {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE parties 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [id]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting party:', error);
      return { success: false, error: error.message };
    }
  }

  // Get party by ID
  static async getPartyById(id) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM parties 
        WHERE id = ? AND (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query, [id]);
      return result.rows._array[0] || null;
    } catch (error) {
      console.error('Error getting party by ID:', error);
      return null;
    }
  }

  // Get customers only
  static async getCustomers() {
    return await this.getAllParties('Customer');
  }

  // Get suppliers only
  static async getSuppliers() {
    return await this.getAllParties('Supplier');
  }
}

export default PartiesService;
