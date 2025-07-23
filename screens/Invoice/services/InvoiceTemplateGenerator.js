// screens/Invoice/services/InvoiceTemplateGenerator.js

class InvoiceTemplateGenerator {
  static getCommonStyles() {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .company-info, .bill-to {
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-details, .bill-to-details {
          font-size: 13px;
          line-height: 1.4;
        }
        
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .meta-item {
          margin-bottom: 10px;
        }
        
        .meta-label {
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .totals-table {
          min-width: 300px;
        }
        
        .totals-table td {
          padding: 8px 12px;
          border: none;
        }
        
        .totals-table .label {
          text-align: left;
          font-weight: 500;
        }
        
        .totals-table .amount {
          text-align: right;
          font-weight: 600;
        }
        
        .total-row {
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
        }
        
        .total-row .label,
        .total-row .amount {
          font-size: 16px;
          font-weight: bold;
        }
        
        .amount-words {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 30px;
          font-style: italic;
        }
        
        .footer {
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
        
        .footer-section {
          margin-bottom: 20px;
        }
        
        .footer-section h4 {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #555;
        }
        
        .footer-section p {
          font-size: 12px;
          line-height: 1.4;
          color: #666;
        }
        
        .thank-you {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #27ae60;
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        @media print {
          .invoice-container {
            max-width: none;
            padding: 0;
          }
        }
      </style>
    `;
  }

  static numberToWords(amount) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) return 'Zero Rupees Only';

    const convertGroup = (num) => {
      let result = '';
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;

      if (hundreds > 0) {
        result += units[hundreds] + ' Hundred ';
      }

      if (remainder >= 20) {
        result += tens[Math.floor(remainder / 10)] + ' ';
        if (remainder % 10 > 0) {
          result += units[remainder % 10] + ' ';
        }
      } else if (remainder >= 10) {
        result += teens[remainder - 10] + ' ';
      } else if (remainder > 0) {
        result += units[remainder] + ' ';
      }

      return result;
    };

    let result = '';
    const integerPart = Math.floor(amount);
    
    if (integerPart >= 10000000) { // Crores
      const crores = Math.floor(integerPart / 10000000);
      result += convertGroup(crores) + 'Crore ';
      amount %= 10000000;
    }
    
    if (integerPart >= 100000) { // Lakhs
      const lakhs = Math.floor(integerPart / 100000);
      result += convertGroup(lakhs) + 'Lakh ';
      amount %= 100000;
    }
    
    if (integerPart >= 1000) { // Thousands
      const thousands = Math.floor(integerPart / 1000);
      result += convertGroup(thousands) + 'Thousand ';
      amount %= 1000;
    }
    
    if (integerPart > 0) {
      result += convertGroup(integerPart);
    }

    return result.trim() + ' Rupees Only';
  }

  static generateProfessionalTemplate(invoiceData) {
    const styles = this.getCommonStyles();
    const subtotal = invoiceData.subtotal || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const total = invoiceData.total || 0;
    const amountInWords = this.numberToWords(total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        ${styles}
        <style>
          .professional-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            margin: -20px -20px 30px -20px;
          }
          .professional-invoice-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .professional-invoice-number {
            font-size: 18px;
            opacity: 0.9;
          }
          .professional-company-name {
            color: white;
            font-size: 24px;
          }
          .professional-items-table th {
            background: #3b82f6;
            color: white;
          }
          .professional-total-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="professional-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="professional-invoice-title">INVOICE</div>
                <div class="professional-invoice-number">#${invoiceData.invoiceNumber}</div>
              </div>
              <div style="text-align: right;">
                <div class="professional-company-name">${invoiceData.businessName || 'Brojgar Business'}</div>
                <div style="font-size: 14px; opacity: 0.9;">Professional Invoice</div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div class="company-info">
              <div class="company-name" style="color: #3b82f6;">${invoiceData.businessName || 'Brojgar Business'}</div>
              <div class="company-details">
                ${invoiceData.businessAddress || 'Business Address'}<br>
                ${invoiceData.businessCity || 'City'}, ${invoiceData.businessState || 'State'} ${invoiceData.businessPincode || 'Pincode'}<br>
                GST: ${invoiceData.businessGST || 'GST Number'}<br>
                Phone: ${invoiceData.businessPhone || 'Phone Number'}<br>
                Email: ${invoiceData.businessEmail || 'email@business.com'}
              </div>
            </div>
            
            <div class="bill-to">
              <h3 style="color: #3b82f6; margin-bottom: 10px;">BILL TO:</h3>
              <div class="bill-to-details">
                <strong>${invoiceData.customerName || 'Customer Name'}</strong><br>
                ${invoiceData.customerAddress || 'Customer Address'}<br>
                ${invoiceData.customerCity || 'City'}, ${invoiceData.customerState || 'State'} ${invoiceData.customerPincode || 'Pincode'}<br>
                ${invoiceData.customerGST ? `GST: ${invoiceData.customerGST}<br>` : ''}
                ${invoiceData.customerPhone ? `Phone: ${invoiceData.customerPhone}<br>` : ''}
                ${invoiceData.customerEmail ? `Email: ${invoiceData.customerEmail}` : ''}
              </div>
            </div>
          </div>

          <div class="invoice-meta">
            <div class="meta-item">
              <div class="meta-label">Invoice Date:</div>
              <div>${invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Due Date:</div>
              <div>${invoiceData.dueDate || 'N/A'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Payment Terms:</div>
              <div>${invoiceData.paymentTerms || 'Net 30'}</div>
            </div>
          </div>

          <table class="items-table professional-items-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Item Description</th>
                <th style="width: 10%;" class="text-center">Qty</th>
                <th style="width: 12%;" class="text-right">Rate</th>
                <th style="width: 10%;" class="text-right">Discount</th>
                <th style="width: 10%;" class="text-center">Tax</th>
                <th style="width: 18%;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                  </td>
                  <td class="text-center">${item.quantity} ${item.unit || 'pcs'}</td>
                  <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                  <td class="text-right">${item.discount ? '₹' + item.discount.toLocaleString('en-IN') : '-'}</td>
                  <td class="text-center">${item.taxRate || 18}%</td>
                  <td class="text-right">₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="professional-total-section">
              <table class="totals-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td class="label">Discount:</td>
                  <td class="amount">-₹${discountAmount.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Tax (${invoiceData.taxRate || 18}%):</td>
                  <td class="amount">₹${taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr class="total-row">
                  <td class="label">TOTAL:</td>
                  <td class="amount" style="color: #3b82f6;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="amount-words">
            <strong>Amount in Words:</strong> ${amountInWords}
          </div>

          <div class="footer">
            ${invoiceData.notes ? `
            <div class="footer-section">
              <h4>Notes:</h4>
              <p>${invoiceData.notes}</p>
            </div>
            ` : ''}
            
            <div class="footer-section">
              <h4>Terms & Conditions:</h4>
              <p>${invoiceData.terms || 'Payment due within 30 days. Late payments may incur additional charges.'}</p>
            </div>

            <div class="footer-section">
              <h4>Payment Information:</h4>
              <p>Please make payment to: ${invoiceData.businessName || 'Brojgar Business'}<br>
              Bank Details: HDFC Bank, A/C: 12345678901, IFSC: HDFC0001234</p>
            </div>
          </div>

          <div class="thank-you">
            Thank You for Your Business! 🙏
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateMinimalTemplate(invoiceData) {
    const styles = this.getCommonStyles();
    const subtotal = invoiceData.subtotal || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const total = invoiceData.total || 0;
    const amountInWords = this.numberToWords(total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        ${styles}
        <style>
          .minimal-header {
            border-bottom: 3px solid #6b7280;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .minimal-invoice-title {
            font-size: 36px;
            font-weight: 300;
            color: #6b7280;
            letter-spacing: 2px;
          }
          .minimal-items-table {
            border: none;
          }
          .minimal-items-table th {
            background: none;
            border-bottom: 2px solid #6b7280;
            color: #6b7280;
            font-weight: 600;
          }
          .minimal-items-table td {
            border-bottom: 1px solid #e5e7eb;
          }
          .minimal-total {
            border: 2px solid #6b7280;
            padding: 15px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="minimal-header">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="minimal-invoice-title">INVOICE</div>
              <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: 600;">#${invoiceData.invoiceNumber}</div>
                <div style="color: #6b7280;">${invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div class="company-info">
              <div class="company-name" style="color: #374151;">${invoiceData.businessName || 'Brojgar Business'}</div>
              <div class="company-details" style="color: #6b7280;">
                ${invoiceData.businessAddress || 'Business Address'}<br>
                ${invoiceData.businessCity || 'City'}, ${invoiceData.businessState || 'State'}<br>
                ${invoiceData.businessGST || 'GST Number'}<br>
                ${invoiceData.businessPhone || 'Phone Number'}
              </div>
            </div>
            
            <div class="bill-to">
              <div style="color: #6b7280; font-weight: 600; margin-bottom: 10px;">BILL TO</div>
              <div class="bill-to-details" style="color: #374151;">
                <strong>${invoiceData.customerName || 'Customer Name'}</strong><br>
                ${invoiceData.customerAddress || 'Customer Address'}<br>
                ${invoiceData.customerCity || 'City'}, ${invoiceData.customerState || 'State'}<br>
                ${invoiceData.customerPhone || 'Phone Number'}
              </div>
            </div>
          </div>

          <table class="items-table minimal-items-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">DESCRIPTION</th>
                <th style="width: 15%;" class="text-center">QTY</th>
                <th style="width: 15%;" class="text-right">RATE</th>
                <th style="width: 20%;" class="text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map((item, index) => `
                <tr>
                  <td class="text-center" style="color: #6b7280;">${index + 1}</td>
                  <td>
                    <div style="font-weight: 600;">${item.name}</div>
                    ${item.description ? `<div style="color: #6b7280; font-size: 12px;">${item.description}</div>` : ''}
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="minimal-total">
              <table class="totals-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                ${taxAmount > 0 ? `
                <tr>
                  <td class="label">Tax:</td>
                  <td class="amount">₹${taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td class="label">TOTAL:</td>
                  <td class="amount">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="amount-words" style="border: 1px solid #e5e7eb;">
            <strong>Amount in Words:</strong> ${amountInWords}
          </div>

          ${invoiceData.notes ? `
          <div class="footer-section">
            <h4>Notes:</h4>
            <p>${invoiceData.notes}</p>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  static generateColorfulTemplate(invoiceData) {
    const styles = this.getCommonStyles();
    const subtotal = invoiceData.subtotal || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const total = invoiceData.total || 0;
    const amountInWords = this.numberToWords(total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        ${styles}
        <style>
          .colorful-header {
            background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin: -20px -20px 30px -20px;
            position: relative;
            overflow: hidden;
          }
          .colorful-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          }
          .colorful-invoice-title {
            font-size: 36px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .colorful-items-table th {
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            color: white;
          }
          .colorful-total-section {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 10px;
            padding: 20px;
            border-left: 5px solid #8b5cf6;
          }
          .colorful-amount-words {
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            color: white;
            border-radius: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="colorful-header">
            <div style="position: relative; z-index: 2;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div class="colorful-invoice-title">INVOICE</div>
                  <div style="font-size: 18px; opacity: 0.9;">#${invoiceData.invoiceNumber}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 24px; font-weight: bold;">${invoiceData.businessName || 'Brojgar Business'}</div>
                  <div style="font-size: 14px; opacity: 0.9;">Colorful & Creative</div>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div class="company-info">
              <div class="company-name" style="color: #8b5cf6;">${invoiceData.businessName || 'Brojgar Business'}</div>
              <div class="company-details">
                ${invoiceData.businessAddress || 'Business Address'}<br>
                ${invoiceData.businessCity || 'City'}, ${invoiceData.businessState || 'State'}<br>
                GST: ${invoiceData.businessGST || 'GST Number'}<br>
                Phone: ${invoiceData.businessPhone || 'Phone Number'}
              </div>
            </div>
            
            <div class="bill-to">
              <h3 style="color: #06b6d4; margin-bottom: 10px;">BILL TO:</h3>
              <div class="bill-to-details">
                <strong>${invoiceData.customerName || 'Customer Name'}</strong><br>
                ${invoiceData.customerAddress || 'Customer Address'}<br>
                ${invoiceData.customerCity || 'City'}, ${invoiceData.customerState || 'State'}<br>
                ${invoiceData.customerPhone || 'Phone Number'}
              </div>
            </div>
          </div>

          <table class="items-table colorful-items-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Item Description</th>
                <th style="width: 10%;" class="text-center">Qty</th>
                <th style="width: 15%;" class="text-right">Rate</th>
                <th style="width: 10%;" class="text-center">Tax</th>
                <th style="width: 25%;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map((item, index) => `
                <tr style="background: ${index % 2 === 0 ? '#f8fafc' : 'white'};">
                  <td class="text-center" style="color: #8b5cf6; font-weight: bold;">${index + 1}</td>
                  <td>
                    <strong style="color: #374151;">${item.name}</strong>
                    ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ''}
                  </td>
                  <td class="text-center">${item.quantity} ${item.unit || 'pcs'}</td>
                  <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                  <td class="text-center">${item.taxRate || 18}%</td>
                  <td class="text-right" style="color: #10b981; font-weight: bold;">₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="colorful-total-section">
              <table class="totals-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td class="label">Discount:</td>
                  <td class="amount" style="color: #ef4444;">-₹${discountAmount.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Tax (${invoiceData.taxRate || 18}%):</td>
                  <td class="amount">₹${taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr class="total-row">
                  <td class="label">TOTAL:</td>
                  <td class="amount" style="color: #8b5cf6; font-size: 18px;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="amount-words colorful-amount-words">
            <strong>Amount in Words:</strong> ${amountInWords}
          </div>

          <div class="footer">
            ${invoiceData.notes ? `
            <div class="footer-section">
              <h4 style="color: #8b5cf6;">Notes:</h4>
              <p>${invoiceData.notes}</p>
            </div>
            ` : ''}
            
            <div class="footer-section">
              <h4 style="color: #06b6d4;">Terms & Conditions:</h4>
              <p>${invoiceData.terms || 'Payment due within 30 days. Late payments may incur additional charges.'}</p>
            </div>
          </div>

          <div class="thank-you" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white;">
            Thank You for Your Business! 🎉
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateClassicTemplate(invoiceData) {
    const styles = this.getCommonStyles();
    const subtotal = invoiceData.subtotal || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const total = invoiceData.total || 0;
    const amountInWords = this.numberToWords(total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        ${styles}
        <style>
          .classic-header {
            border: 3px solid #1f2937;
            padding: 20px;
            margin-bottom: 30px;
            background: #f9fafb;
          }
          .classic-invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            text-align: center;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .classic-items-table {
            border: 2px solid #1f2937;
          }
          .classic-items-table th {
            background: #1f2937;
            color: white;
            font-weight: bold;
          }
          .classic-items-table td {
            border-bottom: 1px solid #d1d5db;
          }
          .classic-total-section {
            border: 2px solid #1f2937;
            background: #f9fafb;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="classic-header">
            <div class="classic-invoice-title">INVOICE</div>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>Invoice Number:</strong> #${invoiceData.invoiceNumber}<br>
                <strong>Date:</strong> ${invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN')}<br>
                <strong>Due Date:</strong> ${invoiceData.dueDate || 'N/A'}
              </div>
              <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: bold; color: #1f2937;">
                  ${invoiceData.businessName || 'Brojgar Business'}
                </div>
                <div style="color: #6b7280;">Traditional Business Solutions</div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div class="company-info" style="border: 1px solid #d1d5db; padding: 15px;">
              <h4 style="margin-bottom: 10px; color: #1f2937;">FROM:</h4>
              <div class="company-name">${invoiceData.businessName || 'Brojgar Business'}</div>
              <div class="company-details">
                ${invoiceData.businessAddress || 'Business Address'}<br>
                ${invoiceData.businessCity || 'City'}, ${invoiceData.businessState || 'State'}<br>
                GST: ${invoiceData.businessGST || 'GST Number'}<br>
                Phone: ${invoiceData.businessPhone || 'Phone Number'}
              </div>
            </div>
            
            <div class="bill-to" style="border: 1px solid #d1d5db; padding: 15px;">
              <h4 style="margin-bottom: 10px; color: #1f2937;">TO:</h4>
              <div class="bill-to-details">
                <strong>${invoiceData.customerName || 'Customer Name'}</strong><br>
                ${invoiceData.customerAddress || 'Customer Address'}<br>
                ${invoiceData.customerCity || 'City'}, ${invoiceData.customerState || 'State'}<br>
                ${invoiceData.customerPhone || 'Phone Number'}
              </div>
            </div>
          </div>

          <table class="items-table classic-items-table">
            <thead>
              <tr>
                <th style="width: 8%;">S.No.</th>
                <th style="width: 40%;">Particulars</th>
                <th style="width: 12%;" class="text-center">Quantity</th>
                <th style="width: 15%;" class="text-right">Rate</th>
                <th style="width: 10%;" class="text-center">Tax %</th>
                <th style="width: 15%;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoiceData.items || []).map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><em style="color: #6b7280;">${item.description}</em>` : ''}
                  </td>
                  <td class="text-center">${item.quantity} ${item.unit || 'pcs'}</td>
                  <td class="text-right">₹${item.price.toLocaleString('en-IN')}</td>
                  <td class="text-center">${item.taxRate || 18}%</td>
                  <td class="text-right">₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="classic-total-section" style="padding: 20px;">
              <table class="totals-table">
                <tr>
                  <td class="label">Sub Total:</td>
                  <td class="amount">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td class="label">Less: Discount:</td>
                  <td class="amount">₹${discountAmount.toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Add: Tax (${invoiceData.taxRate || 18}%):</td>
                  <td class="amount">₹${taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr class="total-row" style="border-top: 2px solid #1f2937; border-bottom: 2px solid #1f2937;">
                  <td class="label">GRAND TOTAL:</td>
                  <td class="amount">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="amount-words" style="border: 1px solid #1f2937;">
            <strong>Rupees in Words:</strong> ${amountInWords}
          </div>

          <div class="footer" style="border-top: 2px solid #1f2937; margin-top: 30px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                ${invoiceData.notes ? `
                <div class="footer-section">
                  <h4>Special Instructions:</h4>
                  <p>${invoiceData.notes}</p>
                </div>
                ` : ''}
                
                <div class="footer-section">
                  <h4>Terms and Conditions:</h4>
                  <p style="font-size: 11px;">${invoiceData.terms || 'Payment due within 30 days. Late payments may incur additional charges.'}</p>
                </div>
              </div>
              
              <div style="width: 48%; text-align: right;">
                <div style="margin-top: 50px; border-top: 1px solid #1f2937; padding-top: 10px;">
                  <strong>Authorized Signature</strong><br>
                  <em>${invoiceData.businessName || 'Brojgar Business'}</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static generateTemplate(templateId, invoiceData) {
    switch (templateId) {
      case 'professional':
        return this.generateProfessionalTemplate(invoiceData);
      case 'minimal':
        return this.generateMinimalTemplate(invoiceData);
      case 'colorful':
        return this.generateColorfulTemplate(invoiceData);
      case 'classic':
        return this.generateClassicTemplate(invoiceData);
      default:
        return this.generateProfessionalTemplate(invoiceData);
    }
  }
}

export default InvoiceTemplateGenerator;