// screens/Invoice/services/InvoiceService.js
import DatabaseService from '../../../database/DatabaseService';

class InvoiceService {
  // Get next invoice number from database
  static async getNextInvoiceNumber() {
    try {
      const db = await DatabaseService.getDatabase();
      const result = await db.getFirstAsync(`
        SELECT COALESCE(MAX(CAST(SUBSTR(invoice_number, 5) AS INTEGER)), 0) + 1 as next_number
        FROM invoices
        WHERE invoice_number LIKE 'INV-%'
      `);
      
      const nextNumber = result?.next_number || 1;
      return `INV-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('❌ Error getting next invoice number:', error);
      return `INV-${String(Date.now()).slice(-3)}`;
    }
  }

  // Get all invoices from database
  static async getAllInvoices() {
    try {
      const db = await DatabaseService.getDatabase();
      const invoices = await db.getAllAsync(`
        SELECT 
          i.*,
          p.name as party_name,
          p.phone,
          p.email,
          p.address_line1,
          p.address_line2,
          p.city,
          p.state,
          p.pincode
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        ORDER BY i.created_at DESC
      `);
      
      return invoices.map(invoice => ({
        id: invoice.id.toString(),
        invoiceNumber: invoice.invoice_number,
        date: invoice.invoice_date,
        dueDate: invoice.due_date,
        partyId: invoice.party_id?.toString(),
        partyName: invoice.party_name || 'Unknown',
        partyDetails: {
          name: invoice.party_name || 'Unknown',
          phone: invoice.phone || '',
          email: invoice.email || '',
          address: this.buildAddress(invoice)
        },
        subtotal: invoice.subtotal || 0,
        taxRate: 18, // Default tax rate
        taxAmount: invoice.tax_amount || 0,
        total: invoice.total_amount || 0,
        paidAmount: invoice.paid_amount || 0,
        balanceAmount: invoice.balance_amount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        status: invoice.status || 'draft',
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      }));
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      return [];
    }
  }

  // Create new invoice in database
  static async createInvoice(invoiceData) {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Begin transaction
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Insert invoice
        const invoiceResult = await db.runAsync(`
          INSERT INTO invoices (
            invoice_number, party_id, invoice_date, due_date,
            subtotal, tax_amount, discount_amount, total_amount,
            paid_amount, balance_amount, status, notes, terms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoiceData.invoiceNumber,
          invoiceData.partyId,
          invoiceData.date,
          invoiceData.dueDate,
          invoiceData.subtotal,
          invoiceData.taxAmount,
          invoiceData.discountAmount || 0,
          invoiceData.total,
          invoiceData.paidAmount || 0,
          invoiceData.total - (invoiceData.paidAmount || 0),
          invoiceData.status || 'draft',
          invoiceData.notes || '',
          invoiceData.terms || ''
        ]);
        
        const invoiceId = invoiceResult.lastInsertRowId;
        
        // Insert invoice items
        if (invoiceData.items && invoiceData.items.length > 0) {
          for (const item of invoiceData.items) {
            await db.runAsync(`
              INSERT INTO invoice_items (
                invoice_id, item_id, item_name, description,
                quantity, unit_price, tax_rate, tax_amount, line_total
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              invoiceId,
              item.itemId || null,
              item.name,
              item.description || '',
              item.quantity,
              item.price,
              item.taxRate || 18,
              item.taxAmount || 0,
              item.total || (item.quantity * item.price)
            ]);
            
            // Update item stock if item exists
            if (item.itemId) {
              await db.runAsync(`
                UPDATE items 
                SET current_stock = current_stock - ?
                WHERE id = ? AND is_active = 1
              `, [item.quantity, item.itemId]);
              
              // Add stock movement record
              await db.runAsync(`
                INSERT INTO stock_movements (
                  item_id, movement_type, quantity, reference_type, reference_id, notes
                ) VALUES (?, 'out', ?, 'invoice', ?, ?)
              `, [
                item.itemId,
                item.quantity,
                invoiceId,
                `Stock out for invoice ${invoiceData.invoiceNumber}`
              ]);
            }
          }
        }
        
        // Commit transaction
        await db.execAsync('COMMIT');
        
        console.log('✅ Invoice created successfully:', invoiceData.invoiceNumber);
        return { success: true, invoiceId, invoiceNumber: invoiceData.invoiceNumber };
        
      } catch (error) {
        // Rollback transaction on error
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // Get invoice by ID
  static async getInvoiceById(invoiceId) {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Get invoice details
      const invoice = await db.getFirstAsync(`
        SELECT 
          i.*,
          p.name as party_name,
          p.phone,
          p.email,
          p.gst_number,
          p.address_line1,
          p.address_line2,
          p.city,
          p.state,
          p.pincode
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.id = ?
      `, [invoiceId]);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Get invoice items
      const items = await db.getAllAsync(`
        SELECT * FROM invoice_items
        WHERE invoice_id = ?
        ORDER BY id ASC
      `, [invoiceId]);
      
      return {
        id: invoice.id.toString(),
        invoiceNumber: invoice.invoice_number,
        date: invoice.invoice_date,
        dueDate: invoice.due_date,
        partyId: invoice.party_id?.toString(),
        partyName: invoice.party_name || 'Unknown',
        partyDetails: {
          name: invoice.party_name || 'Unknown',
          phone: invoice.phone || '',
          email: invoice.email || '',
          gstNumber: invoice.gst_number || '',
          address: this.buildAddress(invoice)
        },
        items: items.map(item => ({
          id: item.id.toString(),
          itemId: item.item_id?.toString(),
          name: item.item_name,
          description: item.description || '',
          quantity: item.quantity,
          price: item.unit_price,
          taxRate: item.tax_rate || 18,
          taxAmount: item.tax_amount || 0,
          total: item.line_total,
          unit: 'pcs' // Default unit
        })),
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.tax_amount || 0,
        discountAmount: invoice.discount_amount || 0,
        total: invoice.total_amount || 0,
        paidAmount: invoice.paid_amount || 0,
        balanceAmount: invoice.balance_amount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || 'Payment due within 30 days',
        status: invoice.status || 'draft',
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      };
    } catch (error) {
      console.error('❌ Error fetching invoice by ID:', error);
      throw error;
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(invoiceId, status) {
    try {
      const db = await DatabaseService.getDatabase();
      await db.runAsync(`
        UPDATE invoices 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, invoiceId]);
      
      console.log('✅ Invoice status updated:', invoiceId, status);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating invoice status:', error);
      return { success: false, error: error.message };
    }
  }

  // Record payment for invoice
  static async recordPayment(invoiceId, paymentData) {
    try {
      const db = await DatabaseService.getDatabase();
      
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Insert payment record
        await db.runAsync(`
          INSERT INTO payments (
            invoice_id, party_id, payment_date, amount, 
            payment_method, reference_number, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          invoiceId,
          paymentData.partyId,
          paymentData.date,
          paymentData.amount,
          paymentData.method || 'cash',
          paymentData.reference || '',
          paymentData.notes || ''
        ]);
        
        // Update invoice paid amount and balance
        await db.runAsync(`
          UPDATE invoices 
          SET 
            paid_amount = paid_amount + ?,
            balance_amount = total_amount - (paid_amount + ?),
            status = CASE 
              WHEN (paid_amount + ?) >= total_amount THEN 'paid'
              ELSE 'partially_paid'
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [paymentData.amount, paymentData.amount, paymentData.amount, invoiceId]);
        
        await db.execAsync('COMMIT');
        
        console.log('✅ Payment recorded successfully');
        return { success: true };
        
      } catch (error) {
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to build address string
  static buildAddress(invoice) {
    const parts = [
      invoice.address_line1,
      invoice.address_line2,
      invoice.city,
      invoice.state,
      invoice.pincode
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  }

  // Format currency
  static formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Convert number to words (for invoice template)
  static numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    function convertHundreds(n) {
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      
      if (n > 0) {
        result += ones[n] + ' ';
      }
      
      return result;
    }
    
    let crores = Math.floor(num / 10000000);
    let lakhs = Math.floor((num % 10000000) / 100000);
    let thousands = Math.floor((num % 100000) / 1000);
    let remainder = num % 1000;
    
    let result = '';
    
    if (crores > 0) {
      result += convertHundreds(crores) + 'Crore ';
    }
    
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + 'Lakh ';
    }
    
    if (thousands > 0) {
      result += convertHundreds(thousands) + 'Thousand ';
    }
    
    if (remainder > 0) {
      result += convertHundreds(remainder);
    }
    
    return result.trim() + ' Only';
  }

  // Get invoice statistics
  static async getInvoiceStatistics() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const [
        totalInvoices,
        totalAmount,
        paidAmount,
        overdueCount
      ] = await Promise.all([
        db.getFirstAsync('SELECT COUNT(*) as count FROM invoices WHERE status != "cancelled"'),
        db.getFirstAsync('SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status != "cancelled"'),
        db.getFirstAsync('SELECT COALESCE(SUM(paid_amount), 0) as total FROM invoices WHERE status != "cancelled"'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM invoices WHERE due_date < date("now") AND balance_amount > 0')
      ]);
      
      return {
        totalInvoices: totalInvoices?.count || 0,
        totalAmount: totalAmount?.total || 0,
        paidAmount: paidAmount?.total || 0,
        pendingAmount: (totalAmount?.total || 0) - (paidAmount?.total || 0),
        overdueCount: overdueCount?.count || 0
      };
    } catch (error) {
      console.error('❌ Error getting invoice statistics:', error);
      return {};
    }
  }
}

export default InvoiceService;
