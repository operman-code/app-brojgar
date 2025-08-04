/**
 * GST Invoice Service
 * 
 * Handles generation of GST-compliant invoice HTML
 * Includes proper tax calculations (CGST/SGST/IGST)
 * Supports inter-state and intra-state transactions
 */

class GSTInvoiceService {
  /**
   * Generate GST-compliant invoice HTML
   * @param {Object} invoiceData - Invoice data from database
   * @param {Object} businessProfile - Business profile data
   * @param {string} template - Template type
   * @returns {Object} - { success: boolean, html: string, fileUri?: string }
   */
  static async generateGSTInvoiceHTML(invoiceData, businessProfile, template = 'gst-compliant') {
    try {
      console.log('🧾 Generating GST invoice HTML...');
      
      // Validate required data
      if (!invoiceData || !businessProfile) {
        throw new Error('Missing invoice data or business profile');
      }

      // Check if inter-state transaction
      const isInterState = this.checkInterStateTransaction(invoiceData, businessProfile);
      
      // Generate HTML
      const html = this.generateHTML(invoiceData, businessProfile, isInterState);
      
      return {
        success: true,
        html: html
      };
    } catch (error) {
      console.error('❌ Error generating GST invoice HTML:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if transaction is inter-state
   * @param {Object} invoiceData - Invoice data
   * @param {Object} businessProfile - Business profile
   * @returns {boolean} - True if inter-state
   */
  static checkInterStateTransaction(invoiceData, businessProfile) {
    // Extract state codes from GSTIN (first 2 digits)
    const businessStateCode = businessProfile.gst_number?.substring(0, 2);
    const customerStateCode = invoiceData.customer_gst_number?.substring(0, 2);
    
    // If customer has GSTIN and different state, it's inter-state
    if (customerStateCode && businessStateCode && customerStateCode !== businessStateCode) {
      return true;
    }
    
    // Check place of supply if available
    if (invoiceData.place_of_supply) {
      const supplyStateCode = invoiceData.place_of_supply.substring(0, 2);
      return supplyStateCode !== businessStateCode;
    }
    
    // Default to intra-state
    return false;
  }

  /**
   * Generate HTML for GST invoice
   * @param {Object} invoiceData - Invoice data
   * @param {Object} businessProfile - Business profile
   * @param {boolean} isInterState - Whether inter-state transaction
   * @returns {string} - HTML string
   */
  static generateHTML(invoiceData, businessProfile, isInterState) {
    const gstRate = this.getGSTRate(invoiceData);
    const taxDetails = this.calculateTaxes(invoiceData, gstRate, isInterState);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GST Invoice - ${invoiceData.invoice_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #fff;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #059669;
            color: white;
            border-radius: 8px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .business-info {
            margin-bottom: 20px;
          }
          
          .business-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .business-details {
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
          }
          
          .customer-section, .invoice-section {
            flex: 1;
          }
          
          .section-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #059669;
          }
          
          .customer-info, .invoice-info {
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
          }
          
          .items-table th {
            background: #f3f4f6;
            padding: 10px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
            border: 1px solid #e5e7eb;
          }
          
          .items-table td {
            padding: 8px;
            text-align: center;
            font-size: 10px;
            border: 1px solid #e5e7eb;
          }
          
          .item-name {
            text-align: left;
            font-weight: 500;
          }
          
          .totals-section {
            margin-top: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          
          .total-label {
            font-weight: bold;
          }
          
          .tax-breakdown {
            margin-top: 15px;
            padding: 10px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 4px;
          }
          
          .tax-title {
            font-weight: bold;
            color: #059669;
            margin-bottom: 8px;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .amount-in-words {
            font-style: italic;
            margin-top: 10px;
            padding: 8px;
            background: #fef3c7;
            border-radius: 4px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="invoice-title">TAX INVOICE</div>
            <div class="business-name">${businessProfile.name || 'Your Business'}</div>
            <div class="business-details">${businessProfile.address || 'Business Address'}</div>
            <div class="business-details">GSTIN: ${businessProfile.gst_number || 'GSTIN Number'}</div>
            <div class="business-details">Phone: ${businessProfile.phone || 'Phone'} | Email: ${businessProfile.email || 'Email'}</div>
          </div>
          
          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="customer-section">
              <div class="section-title">Bill To:</div>
              <div class="customer-info">${invoiceData.customer_name}</div>
              <div class="customer-info">${invoiceData.customer_address || 'Customer Address'}</div>
              <div class="customer-info">GSTIN: ${invoiceData.customer_gst_number || 'N/A'}</div>
              <div class="customer-info">Phone: ${invoiceData.customer_phone || 'N/A'}</div>
            </div>
            
            <div class="invoice-section">
              <div class="section-title">Invoice Details:</div>
              <div class="invoice-info">Invoice No: ${invoiceData.invoice_number}</div>
              <div class="invoice-info">Date: ${this.formatDate(invoiceData.date)}</div>
              <div class="invoice-info">Due Date: ${invoiceData.due_date ? this.formatDate(invoiceData.due_date) : 'N/A'}</div>
              <div class="invoice-info">Place of Supply: ${invoiceData.place_of_supply || 'Same as business location'}</div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Taxable Value (₹)</th>
                ${isInterState ? '<th>IGST %</th><th>IGST Amt (₹)</th>' : '<th>CGST %</th><th>CGST Amt (₹)</th><th>SGST %</th><th>SGST Amt (₹)</th>'}
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${this.generateItemsRows(invoiceData, gstRate, isInterState)}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span>₹${parseFloat(invoiceData.subtotal || 0).toFixed(2)}</span>
            </div>
            
            <div class="tax-breakdown">
              <div class="tax-title">Tax Breakdown:</div>
              ${this.generateTaxBreakdown(taxDetails, isInterState)}
            </div>
            
            <div class="total-row" style="margin-top: 15px; font-size: 16px; font-weight: bold;">
              <span class="total-label">Grand Total:</span>
              <span>₹${parseFloat(invoiceData.total).toFixed(2)}</span>
            </div>
            
            <div class="amount-in-words">
              Amount in Words: ${this.numberToWords(parseFloat(invoiceData.total))} Only
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>This is a computer generated invoice</div>
            <div>Generated on ${new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate table rows for items
   * @param {Object} invoiceData - Invoice data
   * @param {number} gstRate - GST rate
   * @param {boolean} isInterState - Whether inter-state
   * @returns {string} - HTML rows
   */
  static generateItemsRows(invoiceData, gstRate, isInterState) {
    if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
      return '<tr><td colspan="8" style="text-align: center;">No items found</td></tr>';
    }

    return invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const taxableValue = quantity * rate;
      const discount = parseFloat(item.discount) || 0;
      const finalTaxableValue = taxableValue - discount;
      
      let taxAmount = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;
      
      if (isInterState) {
        igstAmount = (finalTaxableValue * gstRate) / 100;
        taxAmount = igstAmount;
      } else {
        cgstAmount = (finalTaxableValue * gstRate) / 200; // Half of GST rate
        sgstAmount = (finalTaxableValue * gstRate) / 200;
        taxAmount = cgstAmount + sgstAmount;
      }
      
      const total = finalTaxableValue + taxAmount;
      
      return `
        <tr>
          <td class="item-name">${item.item_name}</td>
          <td>${item.hsn_code || 'N/A'}</td>
          <td>${quantity}</td>
          <td>${rate.toFixed(2)}</td>
          <td>${finalTaxableValue.toFixed(2)}</td>
          ${isInterState ? 
            `<td>${gstRate}%</td><td>${igstAmount.toFixed(2)}</td>` : 
            `<td>${gstRate/2}%</td><td>${cgstAmount.toFixed(2)}</td><td>${gstRate/2}%</td><td>${sgstAmount.toFixed(2)}</td>`
          }
          <td>${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Generate tax breakdown section
   * @param {Object} taxDetails - Tax calculation details
   * @param {boolean} isInterState - Whether inter-state
   * @returns {string} - HTML tax breakdown
   */
  static generateTaxBreakdown(taxDetails, isInterState) {
    if (isInterState) {
      return `
        <div class="total-row">
          <span>IGST (${taxDetails.gstRate}%):</span>
          <span>₹${taxDetails.igstAmount.toFixed(2)}</span>
        </div>
      `;
    } else {
      return `
        <div class="total-row">
          <span>CGST (${taxDetails.gstRate/2}%):</span>
          <span>₹${taxDetails.cgstAmount.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>SGST (${taxDetails.gstRate/2}%):</span>
          <span>₹${taxDetails.sgstAmount.toFixed(2)}</span>
        </div>
      `;
    }
  }

  /**
   * Calculate taxes for the invoice
   * @param {Object} invoiceData - Invoice data
   * @param {number} gstRate - GST rate
   * @param {boolean} isInterState - Whether inter-state
   * @returns {Object} - Tax details
   */
  static calculateTaxes(invoiceData, gstRate, isInterState) {
    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    
    if (isInterState) {
      const igstAmount = (subtotal * gstRate) / 100;
      return {
        gstRate: gstRate,
        igstAmount: igstAmount,
        totalTax: igstAmount
      };
    } else {
      const cgstAmount = (subtotal * gstRate) / 200;
      const sgstAmount = (subtotal * gstRate) / 200;
      return {
        gstRate: gstRate,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        totalTax: cgstAmount + sgstAmount
      };
    }
  }

  /**
   * Get GST rate from invoice data
   * @param {Object} invoiceData - Invoice data
   * @returns {number} - GST rate
   */
  static getGSTRate(invoiceData) {
    // Default to 18% if not specified
    return parseFloat(invoiceData.gst_rate) || 18;
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} - Formatted date
   */
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  }

  /**
   * Convert number to words
   * @param {number} num - Number to convert
   * @returns {string} - Number in words
   */
  static numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanOneThousand = (n) => {
      if (n === 0) return '';
      
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    };
    
    const convert = (n) => {
      if (n === 0) return 'Zero';
      
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const remainder = n % 1000;
      
      let result = '';
      
      if (crore > 0) {
        result += convertLessThanOneThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        result += convertLessThanOneThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        result += convertLessThanOneThousand(thousand) + ' Thousand ';
      }
      if (remainder > 0) {
        result += convertLessThanOneThousand(remainder);
      }
      
      return result.trim();
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    
    return result;
  }
}

export default GSTInvoiceService;
