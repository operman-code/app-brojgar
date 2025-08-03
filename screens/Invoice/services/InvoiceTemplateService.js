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
        gstin: profile.gstin || '',
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
          p.gstin as customer_gstin
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

  // Generate PDF with better error handling
  static async generatePDF(invoiceData, businessProfile, templateType = 'classic', theme = 'standard') {
    try {
      console.log('🔄 Generating PDF...', { templateType, theme });
      
      let htmlContent;
      
      // Handle GST template separately
      if (templateType === 'gst-compliant') {
        const GSTInvoiceService = require('./GSTInvoiceService').default;
        const result = await GSTInvoiceService.generateGSTInvoiceHTML(invoiceData, businessProfile, templateType);
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate GST invoice HTML');
        }
        htmlContent = result.html;
      } else {
        htmlContent = this.generateHTML(invoiceData, businessProfile, templateType, theme);
      }
      
      // Validate HTML content
      if (!htmlContent || htmlContent.length === 0) {
        throw new Error('Generated HTML content is empty');
      }

      console.log('📄 HTML content generated, length:', htmlContent.length);

      // Generate PDF with timeout
      const { uri } = await Promise.race([
        Print.printToFileAsync({
          html: htmlContent,
          base64: false
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
        )
      ]);

      console.log('✅ PDF generated successfully:', uri);

      return {
        success: true,
        fileUri: uri,
        filename: `${invoiceData.invoice_number}.pdf`
      };
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate PDF'
      };
    }
  }

  // Generate HTML with sanitized content
  static generateHTML(invoiceData, businessProfile, templateType, theme) {
    const formatCurrency = (amount) => {
      try {
        return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
      } catch (error) {
        return `₹${parseFloat(amount || 0).toFixed(2)}`;
      }
    };

    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString('en-IN');
      } catch (error) {
        return dateString || 'N/A';
      }
    };

    const sanitizeText = (text) => {
      if (!text) return '';
      return text.toString()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Theme configurations
    const themeConfigs = {
      standard: {
        primary: '#3B82F6',
        secondary: '#64748B',
        background: '#FFFFFF',
        text: '#1E293B',
        border: '#E2E8F0'
      },
      dark: {
        primary: '#60A5FA',
        secondary: '#94A3B8',
        background: '#1F2937',
        text: '#F1F5F9',
        border: '#374151'
      },
      colorful: {
        primary: '#EC4899',
        secondary: '#F472B6',
        background: '#FFFFFF',
        text: '#1E293B',
        border: '#FCE7F3'
      },
      monochrome: {
        primary: '#000000',
        secondary: '#666666',
        background: '#FFFFFF',
        text: '#000000',
        border: '#CCCCCC'
      },
      pastel: {
        primary: '#F472B6',
        secondary: '#F9A8D4',
        background: '#FDF2F8',
        text: '#581C87',
        border: '#FCE7F3'
      }
    };

    const currentTheme = themeConfigs[theme] || themeConfigs.standard;

    // Base styles with better CSS
    const baseStyles = `
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
          color: ${currentTheme.text};
          background-color: ${currentTheme.background};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
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
          border-bottom: 2px solid ${currentTheme.border};
          padding-bottom: 20px;
        }
        .business-info h1 {
          color: ${currentTheme.primary};
          font-size: 24px;
          margin-bottom: 10px;
        }
        .business-info p {
          margin: 5px 0;
          color: ${currentTheme.secondary};
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          color: ${currentTheme.primary};
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
          color: ${currentTheme.primary};
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
          border: 1px solid ${currentTheme.border};
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: ${currentTheme.primary}20;
          font-weight: bold;
          color: ${currentTheme.primary};
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
          border-bottom: 1px solid ${currentTheme.border};
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 2px solid ${currentTheme.primary};
          color: ${currentTheme.primary};
        }
        .notes {
          margin-top: 40px;
          padding: 20px;
          background-color: ${currentTheme.primary}10;
          border-radius: 8px;
        }
        .notes h4 {
          margin-bottom: 10px;
          color: ${currentTheme.primary};
        }
        @media print {
          body { margin: 0; }
          .container { max-width: none; }
        }
      </style>
    `;

    // Template-specific styles
    let templateStyles = '';
    let isThermal = false;

    switch (templateType) {
      case 'modern':
        templateStyles = `
          <style>
            .header {
              background: linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              border-bottom: none;
            }
            .business-info h1, .invoice-info h2 {
              color: white;
            }
            .items-table th {
              background-color: ${currentTheme.primary};
              color: white;
            }
          </style>
        `;
        break;
      case 'minimal':
        templateStyles = `
          <style>
            .header {
              border-bottom: 1px solid ${currentTheme.border};
            }
            .business-info h1 {
              color: ${currentTheme.text};
              font-weight: 300;
            }
            .invoice-info h2 {
              color: ${currentTheme.text};
              font-weight: 300;
            }
            .items-table {
              border: none;
            }
            .items-table th {
              background-color: ${currentTheme.background};
              border-bottom: 2px solid ${currentTheme.text};
              color: ${currentTheme.text};
            }
            .items-table td {
              border: none;
              border-bottom: 1px solid ${currentTheme.border};
            }
          </style>
        `;
        break;
      case 'corporate':
        templateStyles = `
          <style>
            .header {
              background-color: ${currentTheme.text};
              color: white;
              padding: 30px;
              border-radius: 0;
              border-bottom: none;
            }
            .business-info h1, .invoice-info h2 {
              color: ${currentTheme.primary};
            }
            .items-table th {
              background-color: ${currentTheme.text};
              color: white;
            }
            .billing-info h3 {
              color: ${currentTheme.text};
            }
          </style>
        `;
        break;
      case 'elegant':
        templateStyles = `
          <style>
            .header {
              background: linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.secondary});
              color: white;
              padding: 40px;
              border-radius: 15px;
              border-bottom: none;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .business-info h1 {
              font-family: 'Georgia', serif;
              font-size: 28px;
            }
            .items-table th {
              background: linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.secondary});
              color: white;
            }
          </style>
        `;
        break;
      case 'tech':
        templateStyles = `
          <style>
            .header {
              background: linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary});
              color: white;
              padding: 25px;
              border-radius: 8px;
              border-bottom: none;
            }
            .business-info h1 {
              font-family: 'Courier New', monospace;
              font-weight: bold;
            }
            .items-table th {
              background-color: ${currentTheme.primary};
              color: white;
              font-family: 'Courier New', monospace;
            }
          </style>
        `;
        break;
      case 'retro':
        templateStyles = `
          <style>
            .header {
              background-color: ${currentTheme.primary};
              color: white;
              padding: 25px;
              border-radius: 0;
              border-bottom: 3px solid ${currentTheme.secondary};
            }
            .business-info h1 {
              font-family: 'Times New Roman', serif;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .items-table th {
              background-color: ${currentTheme.primary};
              color: white;
              text-transform: uppercase;
            }
          </style>
        `;
        break;
      case 'thermal-80mm':
        isThermal = true;
        templateStyles = `
          <style>
            .container {
              max-width: 80mm;
              margin: 0 auto;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed ${currentTheme.text};
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .business-info h1 {
              font-size: 16px;
              margin-bottom: 5px;
            }
            .business-info p {
              font-size: 10px;
              margin: 2px 0;
            }
            .invoice-info h2 {
              font-size: 14px;
              margin-bottom: 5px;
            }
            .billing-section {
              margin-bottom: 15px;
            }
            .billing-info h3 {
              font-size: 12px;
              margin-bottom: 5px;
            }
            .items-table {
              width: 100%;
              font-size: 10px;
            }
            .items-table th,
            .items-table td {
              padding: 3px;
              border: none;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .items-table th {
              background: none;
              font-weight: bold;
              border-bottom: 1px solid ${currentTheme.text};
            }
            .totals {
              width: 100%;
              margin-top: 10px;
            }
            .total-row {
              padding: 2px 0;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .total-row.grand-total {
              border-bottom: 2px solid ${currentTheme.text};
              font-weight: bold;
            }
            .notes {
              margin-top: 15px;
              padding: 10px;
              border: 1px solid ${currentTheme.border};
              font-size: 10px;
            }
          </style>
        `;
        break;
      case 'thermal-58mm':
        isThermal = true;
        templateStyles = `
          <style>
            .container {
              max-width: 58mm;
              margin: 0 auto;
              padding: 8px;
              font-family: 'Courier New', monospace;
              font-size: 10px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed ${currentTheme.text};
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .business-info h1 {
              font-size: 14px;
              margin-bottom: 4px;
            }
            .business-info p {
              font-size: 8px;
              margin: 1px 0;
            }
            .invoice-info h2 {
              font-size: 12px;
              margin-bottom: 4px;
            }
            .billing-section {
              margin-bottom: 12px;
            }
            .billing-info h3 {
              font-size: 10px;
              margin-bottom: 4px;
            }
            .items-table {
              width: 100%;
              font-size: 8px;
            }
            .items-table th,
            .items-table td {
              padding: 2px;
              border: none;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .items-table th {
              background: none;
              font-weight: bold;
              border-bottom: 1px solid ${currentTheme.text};
            }
            .totals {
              width: 100%;
              margin-top: 8px;
            }
            .total-row {
              padding: 1px 0;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .total-row.grand-total {
              border-bottom: 2px solid ${currentTheme.text};
              font-weight: bold;
            }
            .notes {
              margin-top: 12px;
              padding: 8px;
              border: 1px solid ${currentTheme.border};
              font-size: 8px;
            }
          </style>
        `;
        break;
      case 'thermal-receipt':
        isThermal = true;
        templateStyles = `
          <style>
            .container {
              max-width: 72mm;
              margin: 0 auto;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed ${currentTheme.text};
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .business-info h1 {
              font-size: 15px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .business-info p {
              font-size: 9px;
              margin: 2px 0;
            }
            .invoice-info h2 {
              font-size: 13px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .billing-section {
              margin-bottom: 15px;
            }
            .billing-info h3 {
              font-size: 11px;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .items-table {
              width: 100%;
              font-size: 9px;
            }
            .items-table th,
            .items-table td {
              padding: 3px;
              border: none;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .items-table th {
              background: none;
              font-weight: bold;
              border-bottom: 1px solid ${currentTheme.text};
            }
            .totals {
              width: 100%;
              margin-top: 10px;
            }
            .total-row {
              padding: 2px 0;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .total-row.grand-total {
              border-bottom: 2px solid ${currentTheme.text};
              font-weight: bold;
            }
            .notes {
              margin-top: 15px;
              padding: 10px;
              border: 1px solid ${currentTheme.border};
              font-size: 9px;
            }
          </style>
        `;
        break;
      case 'thermal-compact':
        isThermal = true;
        templateStyles = `
          <style>
            .container {
              max-width: 60mm;
              margin: 0 auto;
              padding: 8px;
              font-family: 'Courier New', monospace;
              font-size: 9px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed ${currentTheme.text};
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .business-info h1 {
              font-size: 13px;
              margin-bottom: 4px;
            }
            .business-info p {
              font-size: 7px;
              margin: 1px 0;
            }
            .invoice-info h2 {
              font-size: 11px;
              margin-bottom: 4px;
            }
            .billing-section {
              margin-bottom: 12px;
            }
            .billing-info h3 {
              font-size: 9px;
              margin-bottom: 4px;
            }
            .items-table {
              width: 100%;
              font-size: 7px;
            }
            .items-table th,
            .items-table td {
              padding: 2px;
              border: none;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .items-table th {
              background: none;
              font-weight: bold;
              border-bottom: 1px solid ${currentTheme.text};
            }
            .totals {
              width: 100%;
              margin-top: 8px;
            }
            .total-row {
              padding: 1px 0;
              border-bottom: 1px dotted ${currentTheme.border};
            }
            .total-row.grand-total {
              border-bottom: 2px solid ${currentTheme.text};
              font-weight: bold;
            }
            .notes {
              margin-top: 12px;
              padding: 8px;
              border: 1px solid ${currentTheme.border};
              font-size: 7px;
            }
          </style>
        `;
        break;
    }

    // Generate the HTML content with sanitized data
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${sanitizeText(invoiceData.invoice_number)}</title>
        ${baseStyles}
        ${templateStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="business-info">
              <h1>${sanitizeText(businessProfile.name || 'Your Business')}</h1>
              ${businessProfile.address ? `<p>${sanitizeText(businessProfile.address)}</p>` : ''}
              ${businessProfile.phone ? `<p>Phone: ${sanitizeText(businessProfile.phone)}</p>` : ''}
              ${businessProfile.email ? `<p>Email: ${sanitizeText(businessProfile.email)}</p>` : ''}
              ${businessProfile.gst_number ? `<p>GST: ${sanitizeText(businessProfile.gst_number)}</p>` : ''}
            </div>
            <div class="invoice-info">
              <h2>${isThermal ? 'RECEIPT' : 'INVOICE'}</h2>
              <p><strong>#${sanitizeText(invoiceData.invoice_number)}</strong></p>
              <p>Date: ${formatDate(invoiceData.date)}</p>
              ${invoiceData.due_date ? `<p>Due: ${formatDate(invoiceData.due_date)}</p>` : ''}
            </div>
          </div>

          <div class="billing-section">
            <div class="billing-info">
              <h3>${isThermal ? 'CUSTOMER' : 'Bill To:'}</h3>
              <p><strong>${sanitizeText(invoiceData.customer_name)}</strong></p>
              ${invoiceData.customer_address ? `<p>${sanitizeText(invoiceData.customer_address)}</p>` : ''}
              ${invoiceData.customer_phone ? `<p>Phone: ${sanitizeText(invoiceData.customer_phone)}</p>` : ''}
              ${invoiceData.customer_email ? `<p>Email: ${sanitizeText(invoiceData.customer_email)}</p>` : ''}
              ${invoiceData.customer_gst ? `<p>GST: ${sanitizeText(invoiceData.customer_gst)}</p>` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                ${!isThermal ? '<th class="text-right">Tax</th>' : ''}
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map(item => `
                <tr>
                  <td>${sanitizeText(item.item_name)}</td>
                  <td class="text-right">${item.quantity || 0}</td>
                  <td class="text-right">${formatCurrency(item.rate)}</td>
                  ${!isThermal ? `<td class="text-right">${item.tax_rate || 0}%</td>` : ''}
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
            ${!isThermal ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>${formatCurrency(invoiceData.tax_amount)}</span>
              </div>
            ` : ''}
            ${(invoiceData.discount_amount || 0) > 0 ? `
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

          ${(invoiceData.notes || invoiceData.terms) ? `
            <div class="notes">
              ${invoiceData.notes ? `
                <h4>Notes:</h4>
                <p>${sanitizeText(invoiceData.notes)}</p>
              ` : ''}
              ${invoiceData.terms ? `
                <h4>Terms & Conditions:</h4>
                <p>${sanitizeText(invoiceData.terms)}</p>
              ` : ''}
            </div>
          ` : ''}

          ${isThermal ? `
            <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed ${currentTheme.text};">
              <p style="font-size: 8px; color: ${currentTheme.secondary};">
                Thank you for your business!
              </p>
              <p style="font-size: 8px; color: ${currentTheme.secondary};">
                ${new Date().toLocaleDateString('en-IN')} - ${new Date().toLocaleTimeString('en-IN')}
              </p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }

  // Get template preview data
  static getTemplatePreview(templateId, themeId) {
    const templates = {
      'classic': { name: 'Classic', color: '#3B82F6' },
      'modern': { name: 'Modern', color: '#10B981' },
      'minimal': { name: 'Minimal', color: '#8B5CF6' },
      'corporate': { name: 'Corporate', color: '#F59E0B' },
      'elegant': { name: 'Elegant', color: '#EC4899' },
      'tech': { name: 'Tech', color: '#6366F1' },
      'retro': { name: 'Retro', color: '#DC2626' },
      'thermal-80mm': { name: 'Thermal 80mm', color: '#059669' },
      'thermal-58mm': { name: 'Thermal 58mm', color: '#7C3AED' },
      'thermal-receipt': { name: 'Receipt Style', color: '#EA580C' },
      'thermal-compact': { name: 'Compact Thermal', color: '#BE185D' }
    };

    const themes = {
      'standard': { name: 'Standard', color: '#3B82F6' },
      'dark': { name: 'Dark Theme', color: '#1F2937' },
      'colorful': { name: 'Colorful', color: '#EC4899' },
      'monochrome': { name: 'Monochrome', color: '#374151' },
      'pastel': { name: 'Pastel', color: '#F472B6' }
    };

    return {
      template: templates[templateId] || templates['classic'],
      theme: themes[themeId] || themes['standard']
    };
  }
}

export default InvoiceTemplateService;
