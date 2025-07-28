// screens/Search/services/GlobalSearchService.js
import DatabaseService from '../../../database/DatabaseService';

class GlobalSearchService {
  static async init() {
    try {
      // Initialize search tables and indexes if needed
      console.log('✅ Search service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing search service:', error);
      throw error;
    }
  }

  // Global search across all modules
  static async search(query) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          parties: [],
          inventory: [],
          invoices: [],
          transactions: [],
          total: 0
        };
      }

      const [parties, inventory, invoices, transactions] = await Promise.all([
        this.searchParties(query),
        this.searchInventory(query),
        this.searchInvoices(query),
        this.searchTransactions(query)
      ]);

      const results = {
        parties,
        inventory,
        invoices,
        transactions,
        total: parties.length + inventory.length + invoices.length + transactions.length
      };

      // Save recent search
      await this.saveRecentSearch(query, results.total);

      return results;
    } catch (error) {
      console.error('❌ Error performing global search:', error);
      return {
        parties: [],
        inventory: [],
        invoices: [],
        transactions: [],
        total: 0
      };
    }
  }

  // Search parties
  static async searchParties(query) {
    try {
      const searchQuery = `
        SELECT * FROM parties 
        WHERE deleted_at IS NULL 
          AND (
            name LIKE ? OR 
            phone LIKE ? OR 
            email LIKE ? OR
            gst_number LIKE ?
          )
        ORDER BY name ASC
        LIMIT 20
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(searchQuery, params);
    } catch (error) {
      console.error('❌ Error searching parties:', error);
      return [];
    }
  }

  // Search inventory
  static async searchInventory(query) {
    try {
      const searchQuery = `
        SELECT * FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND (
            item_name LIKE ? OR 
            item_code LIKE ? OR 
            category LIKE ? OR
            description LIKE ?
          )
        ORDER BY item_name ASC
        LIMIT 20
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(searchQuery, params);
    } catch (error) {
      console.error('❌ Error searching inventory:', error);
      return [];
    }
  }

  // Search invoices
  static async searchInvoices(query) {
    try {
      const searchQuery = `
        SELECT i.*, p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL 
          AND (
            i.invoice_number LIKE ? OR 
            p.name LIKE ? OR
            i.notes LIKE ?
          )
        ORDER BY i.date DESC
        LIMIT 20
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(searchQuery, params);
    } catch (error) {
      console.error('❌ Error searching invoices:', error);
      return [];
    }
  }

  // Search transactions
  static async searchTransactions(query) {
    try {
      const searchQuery = `
        SELECT t.*, p.name as party_name
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE t.deleted_at IS NULL 
          AND (
            t.reference LIKE ? OR 
            t.description LIKE ? OR
            p.name LIKE ?
          )
        ORDER BY t.date DESC
        LIMIT 20
      `;
      
      const searchTerm = `%${query}%`;
      const params = [searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(searchQuery, params);
    } catch (error) {
      console.error('❌ Error searching transactions:', error);
      return [];
    }
  }

  // Save recent search
  static async saveRecentSearch(query, resultCount) {
    try {
      const insertQuery = `
        INSERT INTO recent_searches (query, results_count) 
        VALUES (?, ?)
      `;
      
      await DatabaseService.executeQuery(insertQuery, [query, resultCount]);
      
      // Keep only last 50 searches
      const cleanupQuery = `
        DELETE FROM recent_searches 
        WHERE id NOT IN (
          SELECT id FROM recent_searches 
          ORDER BY created_at DESC 
          LIMIT 50
        )
      `;
      
      await DatabaseService.executeQuery(cleanupQuery);
    } catch (error) {
      console.error('❌ Error saving recent search:', error);
    }
  }

  // Get recent searches
  static async getRecentSearches() {
    try {
      const query = `
        SELECT * FROM recent_searches 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting recent searches:', error);
      return [];
    }
  }

  // Clear recent searches
  static async clearRecentSearches() {
    try {
      const query = `DELETE FROM recent_searches`;
      await DatabaseService.executeQuery(query);
      console.log('✅ Recent searches cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing recent searches:', error);
      return false;
    }
  }
}

export default GlobalSearchService;
