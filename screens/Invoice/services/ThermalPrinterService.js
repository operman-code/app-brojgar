// screens/Invoice/services/ThermalPrinterService.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

class ThermalPrinterService {
  // Thermal printer configurations
  static thermalConfigs = {
    'thermal-80mm': {
      width: '80mm',
      fontSize: '12px',
      fontFamily: 'Courier New',
      maxChars: 32
    },
    'thermal-58mm': {
      width: '58mm',
      fontSize: '10px',
      fontFamily: 'Courier New',
      maxChars: 24
    },
    'thermal-receipt': {
      width: '72mm',
      fontSize: '11px',
      fontFamily: 'Courier New',
      maxChars: 28
    },
    'thermal-compact': {
      width: '60mm',
      fontSize: '9px',
      fontFamily: 'Courier New',
      maxChars: 26
    }
  };

  // Generate thermal receipt HTML
  static generateThermalHTML(invoiceData, businessProfile, templateType = 'thermal-80mm') {
    const config = this.thermalConfigs[templateType] || this.thermalConfigs['thermal-80mm'];
    
    const formatCurrency = (amount) => {
      return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN');
    };

    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${invoiceData.invoice_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: '${config.fontFamily}', monospace;
            font-size: ${config.fontSize};
            line-height: 1.2;
            color: #000;
            background: #fff;
            width: ${config.width};
            margin: 0 auto;
          }
          .receipt {
            padding: 10px;
            text-align: center;
          }
          .header {
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .business-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-details {
            font-size: 10px;
            margin: 2px 0;
          }
          .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .invoice-number {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .date {
            font-size: 10px;
          }
          .customer-section {
            text-align: left;
            margin-bottom: 15px;
          }
          .customer-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .customer-name {
            font-size: 12px;
            margin-bottom: 2px;
          }
          .items-table {
            width: 100%;
            margin-bottom: 15px;
          }
          .items-table th {
            text-align: left;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding: 3px 0;
            font-size: 10px;
          }
          .items-table td {
            padding: 2px 0;
            border-bottom: 1px dotted #ccc;
            font-size: 10px;
          }
          .item-name {
            width: 50%;
          }
          .item-qty {
            width: 15%;
            text-align: center;
          }
          .item-rate {
            width: 20%;
            text-align: right;
          }
          .item-total {
            width: 15%;
            text-align: right;
          }
          .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-bottom: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 11px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .footer {
            border-top: 1px dashed #000;
            padding-top: 10px;
            text-align: center;
          }
          .footer-text {
            font-size: 8px;
            margin: 2px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="business-name">${truncateText(businessProfile.name || 'Your Business', config.maxChars)}</div>
            ${businessProfile.address ? `<div class="business-details">${truncateText(businessProfile.address, config.maxChars)}</div>` : ''}
            ${businessProfile.phone ? `<div class="business-details">${businessProfile.phone}</div>` : ''}
            ${businessProfile.gst_number ? `<div class="business-details">GST: ${businessProfile.gst_number}</div>` : ''}
          </div>

          <div class="receipt-title">Receipt</div>
          <div class="invoice-number">#${invoiceData.invoice_number}</div>
          <div class="date">${formatDate(invoiceData.date)}</div>

          <div class="customer-section">
            <div class="customer-title">Customer</div>
            <div class="customer-name">${truncateText(invoiceData.customer_name, config.maxChars)}</div>
            ${invoiceData.customer_phone ? `<div class="business-details">${invoiceData.customer_phone}</div>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">Item</th>
                <th class="item-qty">Qty</th>
                <th class="item-rate">Rate</th>
                <th class="item-total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td class="item-name">${truncateText(item.item_name, config.maxChars * 0.5)}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-rate">${formatCurrency(item.rate)}</td>
                  <td class="item-total">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoiceData.subtotal)}</span>
            </div>
            ${invoiceData.tax_amount > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>${formatCurrency(invoiceData.tax_amount)}</span>
              </div>
            ` : ''}
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

          <div class="footer">
            <div class="footer-text">Thank you for your business!</div>
            <div class="footer-text">${new Date().toLocaleDateString('en-IN')}</div>
            <div class="footer-text">${new Date().toLocaleTimeString('en-IN')}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate and share thermal receipt
  static async generateAndShareThermal(invoiceData, businessProfile, templateType = 'thermal-80mm') {
    try {
      const htmlContent = this.generateThermalHTML(invoiceData, businessProfile, templateType);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Receipt ${invoiceData.invoice_number}`
      });

      return {
        success: true,
        fileUri: uri
      };
    } catch (error) {
      console.error('❌ Error generating thermal receipt:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available thermal formats
  static getThermalFormats() {
    return Object.keys(this.thermalConfigs).map(key => ({
      id: key,
      name: this.thermalConfigs[key].width,
      description: `${this.thermalConfigs[key].width} thermal format`,
      fontSize: this.thermalConfigs[key].fontSize,
      maxChars: this.thermalConfigs[key].maxChars
    }));
  }
}

export default ThermalPrinterService;
