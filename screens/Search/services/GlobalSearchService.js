// screens/Search/services/GlobalSearchService.js
import DatabaseService from '../../../database/DatabaseService';

class GlobalSearchService {
  static async search(query, category = 'all', limit = 50) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      await DatabaseService.init();
      const searchTerm = `%${query.trim().toLowerCase()}%`;
      let results = [];

      if (category === 'all' || category === 'parties') {
        const parties = await this.searchParties(searchTerm, limit);
        results.push(...parties);
      }

      if (category === 'all' || category === 'inventory') {
        const inventory = await this.searchInventory(searchTerm, limit);
        results.push(...inventory);
      }

      if (category === 'all' || category === 'invoices') {
        const invoices = await this.searchInvoices(searchTerm, limit);
        results.push(...invoices);
      }

      if (category === 'all' || category === 'transactions') {
        const transactions = await this.searchTransactions(searchTerm, limit);
        results.push(...transactions);
      }

      if (category === 'all' || category === 'reports') {
        const reports = await this.searchReports(searchTerm, limit);
        results.push(...reports);
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Save search query for recent searches
      await this.saveRecentSearch(query.trim());

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error performing global search:', error);
      return [];
    }
  }

  static async searchParties(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT p.*, 
               COALESCE(SUM(CASE WHEN t.type = 'sale' THEN t.amount ELSE -t.amount END), 0) as balance
        FROM parties p
        LEFT JOIN transactions t ON p.id = t.party_id AND t.deleted_at IS NULL
        WHERE p.deleted_at IS NULL 
        AND (
          LOWER(p.name) LIKE ? OR 
          LOWER(p.phone) LIKE ? OR 
          LOWER(p.email) LIKE ? OR 
          LOWER(p.address) LIKE ?
        )
        GROUP BY p.id
        ORDER BY p.name
        LIMIT ?
      `;

      const result = await DatabaseService.executeQuery(query, [
        searchTerm, searchTerm, searchTerm, searchTerm, limit
      ]);

      return result.rows._array.map(party => ({
        id: party.id,
        type: 'party',
        title: party.name,
        subtitle: `${party.type} • ${party.phone}`,
        description: `Balance: ₹${Math.abs(party.balance).toLocaleString('en-IN')} ${party.balance >= 0 ? 'You\'ll Get' : 'You\'ll Give'}`,
        icon: party.type === 'Customer' ? '👤' : '🏢',
        data: party,
        relevanceScore: this.calculateRelevanceScore(searchTerm.replace(/%/g, ''), party.name)
      }));
    } catch (error) {
      console.error('Error searching parties:', error);
      return [];
    }
  }

  static async searchInventory(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT i.*, c.name as category_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.deleted_at IS NULL 
        AND (
          LOWER(i.name) LIKE ? OR 
          LOWER(i.description) LIKE ? OR 
          LOWER(i.sku) LIKE ? OR
          LOWER(c.name) LIKE ?
        )
        ORDER BY i.name
        LIMIT ?
      `;

      const result = await DatabaseService.executeQuery(query, [
        searchTerm, searchTerm, searchTerm, searchTerm, limit
      ]);

      return result.rows._array.map(item => ({
        id: item.id,
        type: 'inventory',
        title: item.name,
        subtitle: `SKU: ${item.sku} • ${item.category_name || 'No Category'}`,
        description: `Stock: ${item.current_stock} • Sale Price: ₹${item.sale_price}`,
        icon: '📦',
        data: item,
        relevanceScore: this.calculateRelevanceScore(searchTerm.replace(/%/g, ''), item.name)
      }));
    } catch (error) {
      console.error('Error searching inventory:', error);
      return [];
    }
  }

  static async searchInvoices(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT i.*, p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL 
        AND (
          LOWER(i.invoice_number) LIKE ? OR 
          LOWER(p.name) LIKE ? OR 
          LOWER(i.notes) LIKE ?
        )
        ORDER BY i.created_at DESC
        LIMIT ?
      `;

      const result = await DatabaseService.executeQuery(query, [
        searchTerm, searchTerm, searchTerm, limit
      ]);

      return result.rows._array.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        title: `Invoice ${invoice.invoice_number}`,
        subtitle: `${invoice.customer_name} • ${new Date(invoice.invoice_date).toLocaleDateString()}`,
        description: `Amount: ₹${invoice.total} • Status: ${invoice.status}`,
        icon: '📄',
        data: invoice,
        relevanceScore: this.calculateRelevanceScore(searchTerm.replace(/%/g, ''), invoice.invoice_number)
      }));
    } catch (error) {
      console.error('Error searching invoices:', error);
      return [];
    }
  }

  static async searchTransactions(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT t.*, p.name as party_name
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE t.deleted_at IS NULL 
        AND (
          LOWER(t.reference_number) LIKE ? OR 
          LOWER(p.name) LIKE ? OR 
          LOWER(t.description) LIKE ?
        )
        ORDER BY t.transaction_date DESC
        LIMIT ?
      `;

      const result = await DatabaseService.executeQuery(query, [
        searchTerm, searchTerm, searchTerm, limit
      ]);

      return result.rows._array.map(transaction => ({
        id: transaction.id,
        type: 'transaction',
        title: `${transaction.type === 'sale' ? 'Sale' : 'Purchase'} - ${transaction.reference_number}`,
        subtitle: `${transaction.party_name} • ${new Date(transaction.transaction_date).toLocaleDateString()}`,
        description: `Amount: ₹${transaction.amount} • ${transaction.payment_method}`,
        icon: transaction.type === 'sale' ? '💰' : '💸',
        data: transaction,
        relevanceScore: this.calculateRelevanceScore(searchTerm.replace(/%/g, ''), transaction.reference_number)
      }));
    } catch (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
  }

  static async searchReports(searchTerm, limit = 10) {
    try {
      // Search in predefined report types and recent report data
      const reportTypes = [
        { name: 'Sales Report', description: 'Detailed sales analysis and trends' },
        { name: 'Purchase Report', description: 'Purchase history and supplier analysis' },
        { name: 'Inventory Report', description: 'Stock levels and inventory valuation' },
        { name: 'Customer Report', description: 'Customer balances and payment history' },
        { name: 'Supplier Report', description: 'Supplier balances and purchase history' },
        { name: 'Tax Report', description: 'GST and tax calculation reports' },
        { name: 'Profit & Loss', description: 'Income and expense analysis' },
        { name: 'Balance Sheet', description: 'Financial position statement' }
      ];

      const matchingReports = reportTypes.filter(report => 
        report.name.toLowerCase().includes(searchTerm.replace(/%/g, '')) ||
        report.description.toLowerCase().includes(searchTerm.replace(/%/g, ''))
      );

      return matchingReports.map((report, index) => ({
        id: `report_${index}`,
        type: 'report',
        title: report.name,
        subtitle: 'Business Report',
        description: report.description,
        icon: '📊',
        data: report,
        relevanceScore: this.calculateRelevanceScore(searchTerm.replace(/%/g, ''), report.name)
      }));
    } catch (error) {
      console.error('Error searching reports:', error);
      return [];
    }
  }

  static calculateRelevanceScore(query, text) {
    if (!query || !text) return 0;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower === queryLower) return 100;
    
    // Starts with query gets high score
    if (textLower.startsWith(queryLower)) return 80;
    
    // Contains query gets medium score
    if (textLower.includes(queryLower)) return 60;
    
    // Word boundary match gets lower score
    const words = textLower.split(' ');
    for (const word of words) {
      if (word.startsWith(queryLower)) return 40;
    }
    
    return 0;
  }

  static async saveRecentSearch(query) {
    try {
      await DatabaseService.init();
      
      // Remove existing entry if exists
      await DatabaseService.executeQuery(
        'DELETE FROM recent_searches WHERE query = ?',
        [query]
      );
      
      // Insert new entry
      await DatabaseService.executeQuery(
        'INSERT INTO recent_searches (query, created_at) VALUES (?, datetime("now"))',
        [query]
      );
      
      // Keep only last 20 searches
      await DatabaseService.executeQuery(`
        DELETE FROM recent_searches 
        WHERE id NOT IN (
          SELECT id FROM recent_searches 
          ORDER BY created_at DESC 
          LIMIT 20
        )
      `);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  static async getRecentSearches(limit = 10) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT query, created_at 
        FROM recent_searches 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [limit]);
      
      return result.rows._array.map(search => ({
        query: search.query,
        timeAgo: this.getTimeAgo(search.created_at)
      }));
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  static async clearRecentSearches() {
    try {
      await DatabaseService.init();
      await DatabaseService.executeQuery('DELETE FROM recent_searches');
      return true;
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      return false;
    }
  }

  static async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) return [];
      
      await DatabaseService.init();
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Get suggestions from different entities
      const suggestions = [];
      
      // Party names
      const partyQuery = `
        SELECT DISTINCT name as suggestion, 'party' as type
        FROM parties 
        WHERE deleted_at IS NULL AND LOWER(name) LIKE ?
        LIMIT 5
      `;
      const parties = await DatabaseService.executeQuery(partyQuery, [searchTerm]);
      suggestions.push(...parties.rows._array);
      
      // Item names
      const itemQuery = `
        SELECT DISTINCT name as suggestion, 'item' as type
        FROM inventory_items 
        WHERE deleted_at IS NULL AND LOWER(name) LIKE ?
        LIMIT 5
      `;
      const items = await DatabaseService.executeQuery(itemQuery, [searchTerm]);
      suggestions.push(...items.rows._array);
      
      // Invoice numbers
      const invoiceQuery = `
        SELECT DISTINCT invoice_number as suggestion, 'invoice' as type
        FROM invoices 
        WHERE deleted_at IS NULL AND LOWER(invoice_number) LIKE ?
        LIMIT 3
      `;
      const invoices = await DatabaseService.executeQuery(invoiceQuery, [searchTerm]);
      suggestions.push(...invoices.rows._array);
      
      return suggestions.slice(0, 10);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  static getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  }

  // Initialize search-related database tables
  static async initializeSearch() {
    try {
      await DatabaseService.init();
      
      // Create recent searches table if not exists
      await DatabaseService.executeQuery(`
        CREATE TABLE IF NOT EXISTS recent_searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      
      // Create search analytics table for future use
      await DatabaseService.executeQuery(`
        CREATE TABLE IF NOT EXISTS search_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          results_count INTEGER DEFAULT 0,
          clicked_result_id TEXT,
          clicked_result_type TEXT,
          created_at TEXT NOT NULL
        )
      `);
      
      console.log('✅ Search tables initialized');
    } catch (error) {
      console.error('Error initializing search tables:', error);
    }
  }

  // Track search analytics (for future improvements)
  static async trackSearchAnalytics(query, resultsCount, clickedResult = null) {
    try {
      await DatabaseService.init();
      
      await DatabaseService.executeQuery(`
        INSERT INTO search_analytics (
          query, results_count, clicked_result_id, clicked_result_type, created_at
        ) VALUES (?, ?, ?, ?, datetime('now'))
      `, [
        query,
        resultsCount,
        clickedResult?.id || null,
        clickedResult?.type || null
      ]);
    } catch (error) {
      console.error('Error tracking search analytics:', error);
    }
  }
}

export default GlobalSearchService;
