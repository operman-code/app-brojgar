// screens/Search/services/GlobalSearchService.js
import DatabaseService from '../../../database/DatabaseService';

class GlobalSearchService {
  static async search(query, category = 'all') {
    try {
      await DatabaseService.init();
      
      if (!query || query.trim().length < 2) return [];
      
      const searchPattern = `%${query.trim()}%`;
      let results = [];
      
      if (category === 'all' || category === 'parties') {
        const parties = await this.searchParties(searchPattern);
        results = [...results, ...parties];
      }
      
      if (category === 'all' || category === 'inventory') {
        const items = await this.searchInventory(searchPattern);
        results = [...results, ...items];
      }
      
      if (category === 'all' || category === 'invoices') {
        const invoices = await this.searchInvoices(searchPattern);
        results = [...results, ...invoices];
      }
      
      if (category === 'all' || category === 'transactions') {
        const transactions = await this.searchTransactions(searchPattern);
        results = [...results, ...transactions];
      }
      
      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('❌ Error searching:', error);
      return [];
    }
  }

  static async searchParties(query) {
    try {
      const parties = await DatabaseService.executeQuery(`
        SELECT id, name, type, phone, email, outstanding_balance
        FROM parties 
        WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?) 
          AND deleted_at IS NULL
        LIMIT 10
      `, [query, query, query]);
      
      return parties.map(party => ({
        id: party.id,
        type: 'party',
        title: party.name,
        subtitle: `${party.type} • ${party.phone}`,
        details: `Balance: ₹${party.outstanding_balance.toLocaleString()}`,
        icon: party.type === 'customer' ? '👤' : '🏢',
        relevance: 90
      }));
    } catch (error) {
      console.error('❌ Error searching parties:', error);
      return [];
    }
  }

  static async searchInventory(query) {
    try {
      const items = await DatabaseService.executeQuery(`
        SELECT i.id, i.name, i.selling_price, i.current_stock, c.name as category
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE (i.name LIKE ? OR i.description LIKE ? OR i.sku LIKE ?)
          AND i.deleted_at IS NULL
        LIMIT 10
      `, [query, query, query]);
      
      return items.map(item => ({
        id: item.id,
        type: 'item',
        title: item.name,
        subtitle: `${item.category || 'Uncategorized'} • ₹${item.selling_price.toLocaleString()}`,
        details: `Stock: ${item.current_stock} units`,
        icon: '📦',
        relevance: 85
      }));
    } catch (error) {
      console.error('❌ Error searching inventory:', error);
      return [];
    }
  }

  static async searchInvoices(query) {
    try {
      const invoices = await DatabaseService.executeQuery(`
        SELECT i.id, i.invoice_number, i.total, i.status, p.name as customer_name
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE (i.invoice_number LIKE ? OR p.name LIKE ?)
          AND i.deleted_at IS NULL
        LIMIT 10
      `, [query, query]);
      
      return invoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        title: invoice.invoice_number,
        subtitle: `${invoice.customer_name} • ₹${invoice.total.toLocaleString()}`,
        details: `Status: ${invoice.status}`,
        icon: '📄',
        relevance: 80
      }));
    } catch (error) {
      console.error('❌ Error searching invoices:', error);
      return [];
    }
  }

  static async searchTransactions(query) {
    try {
      const transactions = await DatabaseService.executeQuery(`
        SELECT i.id, i.invoice_number, i.total, i.invoice_date, p.name as party_name
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE p.name LIKE ? AND i.deleted_at IS NULL
        LIMIT 5
      `, [query]);
      
      return transactions.map(transaction => ({
        id: transaction.id,
        type: 'transaction',
        title: `Sale to ${transaction.party_name}`,
        subtitle: `${transaction.invoice_number} • ₹${transaction.total.toLocaleString()}`,
        details: transaction.invoice_date,
        icon: '💰',
        relevance: 75
      }));
    } catch (error) {
      console.error('❌ Error searching transactions:', error);
      return [];
    }
  }

  static async saveRecentSearch(query) {
    try {
      // Implementation for saving recent searches in local storage or database
      console.log('Saving recent search:', query);
    } catch (error) {
      console.error('❌ Error saving recent search:', error);
    }
  }

  static async getRecentSearches() {
    try {
      // Return recent searches from storage
      return ['iPhone 15', 'Rajesh Kumar', 'January sales'];
    } catch (error) {
      console.error('❌ Error getting recent searches:', error);
      return [];
    }
  }
}

export default GlobalSearchService;
