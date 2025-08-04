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
          p.gst_number as customer_gst_number
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
        text: '#F9FAFB',
        border: '#374151'
      },
      colorful: {
        primary: '#EC4899',
        secondary: '#F472B6',
        background: '#FDF2F8',
        text: '#831843',
        border: '#FCE7F3'
      },
      monochrome: {
        primary: '#374151',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827',
        border: '#D1D5DB'
      },
      pastel: {
        primary: '#F472B6',
        secondary: '#F9A8D4',
        background: '#FDF2F8',
        text: '#831843',
        border: '#FCE7F3'
      }
    };

    const config = themeConfigs[theme] || themeConfigs.standard;

    // Template configurations
    const templateConfigs = {
      classic: {
        headerStyle: 'text-align: center; border-bottom: 2px solid ' + config.primary + '; padding-bottom: 20px;',
        itemStyle: 'border-bottom: 1px solid ' + config.border + '; padding: 10px 0;',
        totalStyle: 'font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px;'
      },
      modern: {
        headerStyle: 'background: ' + config.primary + '; color: white; padding: 20px; border-radius: 8px;',
        itemStyle: 'background: ' + config.background + '; margin: 5px 0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
        totalStyle: 'background: ' + config.primary + '; color: white; padding: 15px; border-radius: 8px; text-align: right; font-weight: bold;'
      },
      minimal: {
        headerStyle: 'border-bottom: 1px solid ' + config.border + '; padding-bottom: 15px;',
        itemStyle: 'padding: 8px 0;',
        totalStyle: 'border-top: 1px solid ' + config.border + '; padding-top: 15px; text-align: right; font-weight: bold;'
      },
      corporate: {
        headerStyle: 'background: ' + config.primary + '; color: white; padding: 25px; border-radius: 0;',
        itemStyle: 'border-left: 4px solid ' + config.primary + '; padding: 15px; margin: 10px 0; background: ' + config.background + ';',
        totalStyle: 'background: ' + config.primary + '; color: white; padding: 20px; text-align: right; font-weight: bold; font-size: 18px;'
      },
      elegant: {
        headerStyle: 'text-align: center; border-bottom: 3px solid ' + config.primary + '; padding: 30px 0; font-family: serif;',
        itemStyle: 'border-bottom: 1px solid ' + config.border + '; padding: 12px 0; font-family: serif;',
        totalStyle: 'border-top: 2px solid ' + config.primary + '; padding-top: 20px; text-align: right; font-weight: bold; font-family: serif; font-size: 20px;'
      },
      tech: {
        headerStyle: 'background: linear-gradient(135deg, ' + config.primary + ', ' + config.secondary + '); color: white; padding: 25px; border-radius: 10px;',
        itemStyle: 'background: ' + config.background + '; border: 1px solid ' + config.border + '; padding: 15px; margin: 8px 0; border-radius: 8px;',
        totalStyle: 'background: linear-gradient(135deg, ' + config.primary + ', ' + config.secondary + '); color: white; padding: 20px; border-radius: 10px; text-align: right; font-weight: bold;'
      },
      retro: {
        headerStyle: 'background: ' + config.primary + '; color: white; padding: 20px; border-radius: 0; font-family: monospace;',
        itemStyle: 'border: 2px solid ' + config.border + '; padding: 10px; margin: 5px 0; background: ' + config.background + '; font-family: monospace;',
        totalStyle: 'background: ' + config.primary + '; color: white; padding: 15px; text-align: right; font-weight: bold; font-family: monospace;'
      }
    };

    const template = templateConfigs[templateType] || templateConfigs.classic;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${sanitizeText(invoiceData.invoice_number)}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: ${config.background};
            color: ${config.text};
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            ${template.headerStyle}
            margin-bottom: 30px;
          }
          .business-info {
            text-align: left;
          }
          .business-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-details {
            font-size: 14px;
            color: ${config.secondary};
            margin-bottom: 3px;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .invoice-number {
            font-size: 16px;
            margin-bottom: 5px;
          }
          .invoice-date {
            font-size: 14px;
            color: ${config.secondary};
          }
          .customer-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: ${config.primary};
          }
          .customer-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .customer-details {
            font-size: 14px;
            color: ${config.secondary};
            margin-bottom: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-header {
            background-color: ${config.primary};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .item-row {
            ${template.itemStyle}
          }
          .item-name {
            font-weight: 600;
          }
          .item-qty {
            text-align: center;
          }
          .item-rate {
            text-align: right;
          }
          .item-total {
            text-align: right;
            font-weight: bold;
          }
          .totals-section {
            ${template.totalStyle}
            margin-top: 30px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .total-label {
            font-weight: 600;
          }
          .total-value {
            font-weight: bold;
          }
          .grand-total {
            font-size: 20px;
            color: ${config.primary};
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid ${config.border};
            text-align: center;
            font-size: 12px;
            color: ${config.secondary};
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="business-info">
                <div class="business-name">${sanitizeText(businessProfile.name)}</div>
                <div class="business-details">${sanitizeText(businessProfile.address)}</div>
                <div class="business-details">${sanitizeText(businessProfile.phone)} • ${sanitizeText(businessProfile.email)}</div>
              </div>
              <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${sanitizeText(invoiceData.invoice_number)}</div>
                <div class="invoice-date">Date: ${formatDate(invoiceData.date)}</div>
              </div>
            </div>
          </div>

          <div class="customer-section">
            <div class="section-title">Bill To:</div>
            <div class="customer-name">${sanitizeText(invoiceData.customer_name)}</div>
            <div class="customer-details">${sanitizeText(invoiceData.customer_phone || '')}</div>
            <div class="customer-details">${sanitizeText(invoiceData.customer_email || '')}</div>
            <div class="customer-details">${sanitizeText(invoiceData.customer_address || '')}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="items-header">Item</th>
                <th class="items-header" style="text-align: center;">Qty</th>
                <th class="items-header" style="text-align: right;">Rate</th>
                <th class="items-header" style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map(item => `
                <tr class="item-row">
                  <td class="item-name">${sanitizeText(item.item_name)}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-rate">${formatCurrency(item.rate)}</td>
                  <td class="item-total">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${formatCurrency(invoiceData.subtotal || 0)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax (${invoiceData.tax_rate || 18}%):</span>
              <span class="total-value">${formatCurrency(invoiceData.tax_amount || 0)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total:</span>
              <span class="total-value">${formatCurrency(invoiceData.total)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated by Brojgar Business App</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getTemplatePreview(templateId, themeId) {
    const templates = {
      classic: { name: 'Classic', description: 'Clean and professional design' },
      modern: { name: 'Modern', description: 'Contemporary layout with bold headers' },
      minimal: { name: 'Minimal', description: 'Simple and elegant design' },
      corporate: { name: 'Corporate', description: 'Professional business template' },
      elegant: { name: 'Elegant', description: 'Sophisticated design with premium feel' },
      tech: { name: 'Tech', description: 'Modern tech company style' },
      retro: { name: 'Retro', description: 'Vintage-inspired design' }
    };

    const themes = {
      standard: { name: 'Standard', description: 'Regular business colors' },
      dark: { name: 'Dark Theme', description: 'Dark mode for better contrast' },
      colorful: { name: 'Colorful', description: 'Vibrant and eye-catching' },
      monochrome: { name: 'Monochrome', description: 'Black and white only' },
      pastel: { name: 'Pastel', description: 'Soft and gentle colors' }
    };

    return {
      template: templates[templateId] || templates.classic,
      theme: themes[themeId] || themes.standard
    };
  }
}

export default InvoiceTemplateService;
