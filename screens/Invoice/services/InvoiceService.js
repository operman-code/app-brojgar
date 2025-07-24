// screens/Invoice/services/InvoiceService.js
import DatabaseService from '../../../database/DatabaseService';

class InvoiceService {
  static async createInvoice(invoiceData) {
    try {
      await DatabaseService.init();
      
      const invoiceNumber = await DatabaseService.getNextInvoiceNumber();
      const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const taxAmount = (subtotal * (invoiceData.tax || 18)) / 100;
      const discountAmount = (subtotal * (invoiceData.discount || 0)) / 100;
      const total = subtotal - discountAmount + taxAmount;
      
      // Create invoice
      const invoiceId = await DatabaseService.create('invoices', {
        invoice_number: invoiceNumber,
        party_id: invoiceData.customer.id,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: invoiceData.dueDate || null,
        subtotal: subtotal,
        tax_rate: invoiceData.tax || 18,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total: total,
        status: 'pending',
        notes: invoiceData.notes || null,
        terms_conditions: invoiceData.terms || null
      });
      
      // Create invoice items
      for (const item of invoiceData.items) {
        await DatabaseService.create('invoice_items', {
          invoice_id: invoiceId,
          item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.quantity * item.price
        });
        
        // Update stock
        await DatabaseService.executeRun(
          'UPDATE items SET current_stock = current_stock - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }
      
      return { invoiceId, invoiceNumber, total };
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  }

  static async getAllInvoices() {
    try {
      const invoices = await DatabaseService.executeQuery(`
        SELECT 
          i.*,
          p.name as customer_name,
          p.phone as customer_phone
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE i.deleted_at IS NULL
        ORDER BY i.created_at DESC
      `);
      
      return invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        customerPhone: invoice.customer_phone,
        date: invoice.invoice_date,
        total: invoice.total,
        status: invoice.status
      }));
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      return [];
    }
  }

  static async getInvoiceById(id) {
    try {
      const invoice = await DatabaseService.executeQuery(`
        SELECT 
          i.*,
          p.name as customer_name,
          p.phone as customer_phone,
          p.email as customer_email,
          p.address as customer_address
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE i.id = ? AND i.deleted_at IS NULL
      `, [id]);
      
      if (invoice.length === 0) return null;
      
      const items = await DatabaseService.executeQuery(`
        SELECT 
          ii.*,
          i.name as item_name
        FROM invoice_items ii
        JOIN items i ON ii.item_id = i.id
        WHERE ii.invoice_id = ?
      `, [id]);
      
      return {
        ...invoice[0],
        items: items
      };
    } catch (error) {
      console.error('❌ Error fetching invoice:', error);
      return null;
    }
  }
}

export default InvoiceService;
