// screens/Invoice/services/InvoiceService.js
import DatabaseService from '../../../database/DatabaseService';

class InvoiceService {
  // Get next invoice number
  static async getNextInvoiceNumber() {
    try {
      return await DatabaseService.getNextInvoiceNumber();
    } catch (error) {
      console.error('❌ Error getting next invoice number:', error);
      return `INV${Date.now()}`;
    }
  }

  // Create new invoice
  static async createInvoice(invoiceData) {
    try {
      // Insert invoice
      const invoiceQuery = `
        INSERT INTO invoices (
          invoice_number, party_id, date, due_date, 
          subtotal, tax_amount, discount_amount, total, 
          notes, terms, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const invoiceParams = [
        invoiceData.invoice_number,
        invoiceData.party_id,
        invoiceData.date,
        invoiceData.due_date,
        invoiceData.subtotal,
        invoiceData.tax_amount,
        invoiceData.discount_amount,
        invoiceData.total,
        invoiceData.notes || '',
        invoiceData.terms || '',
        'draft'
      ];

      const invoiceResult = await DatabaseService.executeQuery(invoiceQuery, invoiceParams);
      const invoiceId = invoiceResult.lastInsertRowId;

      // Insert invoice items
      for (const item of invoiceData.items) {
        const itemQuery = `
          INSERT INTO invoice_items (
            invoice_id, item_id, item_name, quantity, 
            rate, tax_rate, tax_amount, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const itemParams = [
          invoiceId,
          item.item_id,
          item.item_name,
          item.quantity,
          item.rate,
          item.tax_rate,
          item.tax_amount,
          item.total
        ];

        await DatabaseService.executeQuery(itemQuery, itemParams);

        // Update inventory stock
        await this.updateInventoryStock(item.item_id, item.quantity);
      }

      console.log('✅ Invoice created successfully');
      return { success: true, invoiceId };
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  }

  // Update inventory stock
  static async updateInventoryStock(itemId, soldQuantity) {
    try {
      const updateQuery = `
        UPDATE inventory_items 
        SET stock_quantity = stock_quantity - ? 
        WHERE id = ?
      `;

      await DatabaseService.executeQuery(updateQuery, [soldQuantity, itemId]);
    } catch (error) {
      console.error('❌ Error updating inventory stock:', error);
    }
  }

  // Get all invoices
  static async getAllInvoices() {
    try {
      const query = `
        SELECT 
          i.*,
          p.name as customer_name
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL
        ORDER BY i.date DESC
      `;

      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting invoices:', error);
      return [];
    }
  }

  // Get invoice by ID
  static async getInvoiceById(invoiceId) {
    try {
      const invoiceQuery = `
        SELECT 
          i.*,
          p.name as customer_name,
          p.phone as customer_phone,
          p.email as customer_email,
          p.address as customer_address
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.id = ? AND i.deleted_at IS NULL
      `;

      const invoice = await DatabaseService.executeQuery(invoiceQuery, [invoiceId]);
      
      if (invoice.length === 0) return null;

      const itemsQuery = `
        SELECT * FROM invoice_items 
        WHERE invoice_id = ? AND deleted_at IS NULL
      `;

      const items = await DatabaseService.executeQuery(itemsQuery, [invoiceId]);

      return {
        ...invoice[0],
        items
      };
    } catch (error) {
      console.error('❌ Error getting invoice by ID:', error);
      return null;
    }
  }
}

export default InvoiceService;
