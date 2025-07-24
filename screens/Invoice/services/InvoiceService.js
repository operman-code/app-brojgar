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
      
      // Create invoice items and update stock
      for (const item of invoiceData.items) {
        await DatabaseService.create('invoice_items', {
          invoice_id: invoiceId,
          item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.quantity * item.price
        });
        
        // Update item stock
        await DatabaseService.executeRun(
          'UPDATE items SET current_stock = current_stock - ? WHERE id = ?',
          [item.quantity, item.id]
        );
        
        // Create stock movement record
        await DatabaseService.create('stock_movements', {
          item_id: item.id,
          movement_type: 'sale',
          quantity: -item.quantity,
          reference_type: 'invoice',
          reference_id: invoiceId,
          notes: `Sale via invoice ${invoiceNumber}`
        });
      }
      
      // Update party balance
      await DatabaseService.executeRun(
        'UPDATE parties SET outstanding_balance = outstanding_balance + ? WHERE id = ?',
        [total, invoiceData.customer.id]
      );
      
      // Create notification
      await DatabaseService.create('notifications', {
        title: 'Invoice Created',
        message: `Invoice ${invoiceNumber} created for ${invoiceData.customer.name} - ₹${total.toLocaleString()}`,
        type: 'sale',
        priority: 'medium',
        read: 0
      });
      
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
        dueDate: invoice.due_date,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        discountAmount: invoice.discount_amount,
        total: invoice.total,
        status: invoice.status,
        notes: invoice.notes,
        terms: invoice.terms_conditions
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

  static async updateInvoiceStatus(invoiceId, status) {
    try {
      const result = await DatabaseService.update('invoices', invoiceId, { status });
      
      if (result > 0) {
        await DatabaseService.create('notifications', {
          title: 'Invoice Updated',
          message: `Invoice status changed to ${status}`,
          type: 'info',
          priority: 'low',
          read: 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error updating invoice status:', error);
      throw error;
    }
  }

  static async getNextInvoiceNumber() {
    try {
      return await DatabaseService.getNextInvoiceNumber();
    } catch (error) {
      console.error('❌ Error getting next invoice number:', error);
      return `INV-${new Date().getFullYear()}-001`;
    }
  }

  static async searchInvoices(query) {
    try {
      const invoices = await DatabaseService.executeQuery(`
        SELECT 
          i.*,
          p.name as customer_name
        FROM invoices i
        JOIN parties p ON i.party_id = p.id
        WHERE (i.invoice_number LIKE ? OR p.name LIKE ?)
          AND i.deleted_at IS NULL
        ORDER BY i.created_at DESC
      `, [`%${query}%`, `%${query}%`]);
      
      return invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        total: invoice.total,
        status: invoice.status,
        date: invoice.invoice_date
      }));
    } catch (error) {
      console.error('❌ Error searching invoices:', error);
      return [];
    }
  }

  static async deleteInvoice(invoiceId) {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      // Restore stock for all items
      const items = await DatabaseService.executeQuery(`
        SELECT ii.*, i.name as item_name
        FROM invoice_items ii
        JOIN items i ON ii.item_id = i.id
        WHERE ii.invoice_id = ?
      `, [invoiceId]);
      
      for (const item of items) {
        await DatabaseService.executeRun(
          'UPDATE items SET current_stock = current_stock + ? WHERE id = ?',
          [item.quantity, item.item_id]
        );
        
        // Create stock movement record
        await DatabaseService.create('stock_movements', {
          item_id: item.item_id,
          movement_type: 'return',
          quantity: item.quantity,
          reference_type: 'invoice_cancel',
          reference_id: invoiceId,
          notes: `Stock restored from cancelled invoice ${invoice.invoice_number}`
        });
      }
      
      // Restore party balance
      await DatabaseService.executeRun(
        'UPDATE parties SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
        [invoice.total, invoice.party_id]
      );
      
      // Soft delete invoice
      const result = await DatabaseService.softDelete('invoices', invoiceId);
      
      if (result > 0) {
        await DatabaseService.create('notifications', {
          title: 'Invoice Cancelled',
          message: `Invoice ${invoice.invoice_number} has been cancelled`,
          type: 'warning',
          priority: 'medium',
          read: 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting invoice:', error);
      throw error;
    }
  }

  static calculateInvoiceTotals(items, discountPercent = 0, taxPercent = 18) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  }

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
}

export default InvoiceService;
