// screens/Invoice/services/InvoiceTemplateService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

class InvoiceTemplateService {
  // Get business profile
  static async getBusinessProfile() {
    try {
      const query = `
        SELECT key, value 
        FROM business_settings 
        WHERE deleted_at IS NULL 
          AND key LIKE 'business_%'
      `;
      
      const settings = await DatabaseService.executeQuery(query);
      const profile = {};
      
      settings.forEach(setting => {
        const key = setting.key.replace('business_', '');
        profile[key] = setting.value;
      });
      
      return {
        name: profile.name || 'Your Business',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        gst_number: profile.gst_number || '',
        ...profile
      };
    } catch (error) {
      console.error('❌ Error getting business profile:', error);
      return {};
    }
  }

  // Get invoice by ID with items
  static async getInvoiceById(invoiceId) {
    try {
      const invoiceQuery = `
        SELECT 
          i.*,
          p.name as customer_name,
          p.phone as customer_phone,
          p.email as customer_email,
          p.address as customer_address,
          p.gst_number as customer_gst
        FROM invoices i
        LEFT JOIN parties p ON i.party_id = p.id
        WHERE i.id = ? AND i.deleted_at IS NULL
      `;

      const invoice = await DatabaseService.executeQuery(invoiceQuery, [invoiceId]);
      
      if (invoice.length === 0) return null;

      const itemsQuery = `
        SELECT * FROM invoice_items 
        WHERE invoice_id = ? AND deleted_at IS NULL
        ORDER BY id ASC
      `;

      const items = await DatabaseService.executeQuery(itemsQuery, [invoiceId]);

      return {
        ...invoice[0],
        items: items || []
      };
    } catch (error) {
      console.error('❌ Error getting invoice by ID:', error);
      return null;
    }
  }

  // Generate PDF
  static async generatePDF(invoiceData, businessProfile, templateType = 'classic') {
    try {
      const htmlContent = this.generateHTML(invoiceData, businessProfile, templateType);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      return {
        success: true,
        fileUri: uri,
        filename: `${invoiceData.invoice_number}.pdf`
      };
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate HTML for different templates
  static generateHTML(invoiceData, businessProfile, templateType) {
    const commonStyles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .business-info h1 {
          color: #2563eb;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .business-info p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          color: #2563eb;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .billing-info {
          flex: 1;
        }
        .billing-info h3 {
          color: #2563eb;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #2563eb;
        }
        .items-table .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 2px solid #2563eb;
          color: #2563eb;
        }
        .notes {
          margin-top: 40px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .notes h4 {
          margin-bottom: 10px;
          color: #2563eb;
        }
      </style>
    `;

    const formatCurrency = (amount) => {
      return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN');
    };

    let templateSpecificStyles = '';
    
    // Template-specific styling
    switch (templateType) {
      case 'modern':
        templateSpecificStyles = `
          <style>
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              border-bottom: none;
            }
            .business-info h1, .invoice-info h2 {
              color: white;
            }
            .items-table th {
              background-color: #667eea;
              color: white;
            }
          </style>
        `;
        break;
      case 'minimal':
        templateSpecificStyles = `
          <style>
            .header {
              border-bottom: 1px solid #ccc;
            }
            .business-info h1 {
              color: #333;
              font-weight: 300;
            }
            .invoice-info h2 {
              color: #333;
              font-weight: 300;
            }
            .items-table {
              border: none;
            }
            .items-table th {
              background-color: white;
              border-bottom: 2px solid #333;
              color: #333;
            }
            .items-table td {
              border: none;
              border-bottom: 1px solid #eee;
            }
          </style>
        `;
        break;
      case 'corporate':
        templateSpecificStyles = `
          <style>
            .header {
              background-color: #1f2937;
              color: white;
              padding: 30px;
              border-radius: 0;
              border-bottom: none;
            }
            .business-info h1, .invoice-info h2 {
              color: #f59e0b;
            }
            .items-table th {
              background-color: #1f2937;
              color: white;
            }
            .billing-info h3 {
              color: #1f2937;
            }
          </style>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoice_number}</title>
        ${commonStyles}
        ${templateSpecificStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="business-info">
              <h1>${businessProfile.name || 'Your Business'}</h1>
              ${businessProfile.address ? `<p>${businessProfile.address}</p>` : ''}
              ${businessProfile.phone ? `<p>Phone: ${businessProfile.phone}</p>` : ''}
              ${businessProfile.email ? `<p>Email: ${businessProfile.email}</p>` : ''}
              ${businessProfile.gst_number ? `<p>GST: ${businessProfile.gst_number}</p>` : ''}
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>#${invoiceData.invoice_number}</strong></p>
              <p>Date: ${formatDate(invoiceData.date)}</p>
              ${invoiceData.due_date ? `<p>Due: ${formatDate(invoiceData.due_date)}</p>` : ''}
            </div>
          </div>

          <div class="billing-section">
            <div class="billing-info">
              <h3>Bill To:</h3>
              <p><strong>${invoiceData.customer_name}</strong></p>
              ${invoiceData.customer_address ? `<p>${invoiceData.customer_address}</p>` : ''}
              ${invoiceData.customer_phone ? `<p>Phone: ${invoiceData.customer_phone}</p>` : ''}
              ${invoiceData.customer_email ? `<p>Email: ${invoiceData.customer_email}</p>` : ''}
              ${invoiceData.customer_gst ? `<p>GST: ${invoiceData.customer_gst}</p>` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Tax</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.rate)}</td>
                  <td class="text-right">${item.tax_rate}%</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoiceData.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatCurrency(invoiceData.tax_amount)}</span>
            </div>
            ${invoiceData.discount_amount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-${formatCurrency(invoiceData.discount_amount)}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>${formatCurrency(invoiceData.total)}</span>
            </div>
          </div>

          ${invoiceData.notes || invoiceData.terms ? `
            <div class="notes">
              ${invoiceData.notes ? `
                <h4>Notes:</h4>
                <p>${invoiceData.notes}</p>
              ` : ''}
              ${invoiceData.terms ? `
                <h4>Terms & Conditions:</h4>
                <p>${invoiceData.terms}</p>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
}

export default InvoiceTemplateService;
