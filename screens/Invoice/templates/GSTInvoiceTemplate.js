import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * GST Invoice Template Component
 * 
 * A React Native component for rendering GST-compliant invoices
 * Includes proper tax calculations and formatting
 */

const GSTInvoiceTemplate = ({ invoiceData, businessProfile, isPreview = false }) => {
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const calculateTaxes = (items, gstRate = 18) => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    items?.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const taxableValue = quantity * rate;
      const discount = parseFloat(item.discount) || 0;
      const finalTaxableValue = taxableValue - discount;
      
      subtotal += finalTaxableValue;
      
      // For preview, assume intra-state (CGST + SGST)
      const cgstAmount = (finalTaxableValue * gstRate) / 200;
      const sgstAmount = (finalTaxableValue * gstRate) / 200;
      
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
    });

    return {
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      total: subtotal + totalCGST + totalSGST
    };
  };

  const taxDetails = calculateTaxes(invoiceData?.items);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
        <Text style={styles.businessName}>
          {businessProfile?.name || 'Your Business'}
        </Text>
        <Text style={styles.businessDetails}>
          {businessProfile?.address || 'Business Address'}
        </Text>
        <Text style={styles.businessDetails}>
          GSTIN: {businessProfile?.gstin || 'GSTIN Number'}
        </Text>
        <Text style={styles.businessDetails}>
          Phone: {businessProfile?.phone || 'Phone'} | Email: {businessProfile?.email || 'Email'}
        </Text>
      </View>

      {/* Invoice Details */}
      <View style={styles.detailsSection}>
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.customerInfo}>{invoiceData?.customer_name}</Text>
          <Text style={styles.customerInfo}>
            {invoiceData?.customer_address || 'Customer Address'}
          </Text>
          <Text style={styles.customerInfo}>
            GSTIN: {invoiceData?.customer_gstin || 'N/A'}
          </Text>
          <Text style={styles.customerInfo}>
            Phone: {invoiceData?.customer_phone || 'N/A'}
          </Text>
        </View>

        <View style={styles.invoiceSection}>
          <Text style={styles.sectionTitle}>Invoice Details:</Text>
          <Text style={styles.invoiceInfo}>
            Invoice No: {invoiceData?.invoice_number}
          </Text>
          <Text style={styles.invoiceInfo}>
            Date: {formatDate(invoiceData?.date)}
          </Text>
          <Text style={styles.invoiceInfo}>
            Due Date: {invoiceData?.due_date ? formatDate(invoiceData.due_date) : 'N/A'}
          </Text>
          <Text style={styles.invoiceInfo}>
            Place of Supply: {invoiceData?.place_of_supply || 'Same as business location'}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.itemCell]}>Item Description</Text>
          <Text style={styles.headerCell}>HSN/SAC</Text>
          <Text style={styles.headerCell}>Qty</Text>
          <Text style={styles.headerCell}>Rate</Text>
          <Text style={styles.headerCell}>Taxable Value</Text>
          <Text style={styles.headerCell}>CGST</Text>
          <Text style={styles.headerCell}>SGST</Text>
          <Text style={styles.headerCell}>Total</Text>
        </View>

        {invoiceData?.items?.map((item, index) => {
          const quantity = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const taxableValue = quantity * rate;
          const discount = parseFloat(item.discount) || 0;
          const finalTaxableValue = taxableValue - discount;
          const gstRate = 18; // Default GST rate
          const cgstAmount = (finalTaxableValue * gstRate) / 200;
          const sgstAmount = (finalTaxableValue * gstRate) / 200;
          const total = finalTaxableValue + cgstAmount + sgstAmount;

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, styles.itemCell]} numberOfLines={2}>
                {item.item_name}
              </Text>
              <Text style={styles.cell}>{item.hsn_code || 'N/A'}</Text>
              <Text style={styles.cell}>{quantity}</Text>
              <Text style={styles.cell}>{formatCurrency(rate)}</Text>
              <Text style={styles.cell}>{formatCurrency(finalTaxableValue)}</Text>
              <Text style={styles.cell}>{formatCurrency(cgstAmount)}</Text>
              <Text style={styles.cell}>{formatCurrency(sgstAmount)}</Text>
              <Text style={styles.cell}>{formatCurrency(total)}</Text>
            </View>
          );
        })}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(taxDetails.subtotal)}</Text>
        </View>

        <View style={styles.taxBreakdown}>
          <Text style={styles.taxTitle}>Tax Breakdown:</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>CGST (9%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(taxDetails.cgst)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SGST (9%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(taxDetails.sgst)}</Text>
          </View>
        </View>

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(taxDetails.total)}</Text>
        </View>

        <View style={styles.amountInWords}>
          <Text style={styles.amountInWordsText}>
            Amount in Words: {numberToWords(taxDetails.total)} Only
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for your business!</Text>
        <Text style={styles.footerText}>This is a computer generated invoice</Text>
        <Text style={styles.footerText}>
          Generated on {new Date().toLocaleString('en-IN')}
        </Text>
      </View>
    </ScrollView>
  );
};

// Helper function to convert number to words
const numberToWords = (num) => {
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    backgroundColor: '#059669',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  businessDetails: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 2,
  },
  detailsSection: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  customerSection: {
    flex: 1,
    marginRight: 8,
  },
  invoiceSection: {
    flex: 1,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  customerInfo: {
    fontSize: 12,
    marginBottom: 2,
    color: '#374151',
  },
  invoiceInfo: {
    fontSize: 12,
    marginBottom: 2,
    color: '#374151',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
  },
  itemCell: {
    flex: 2,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center',
    color: '#6b7280',
  },
  totalsSection: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    color: '#374151',
  },
  taxBreakdown: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 4,
  },
  taxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  amountInWords: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  amountInWordsText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#92400e',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
});

export default GSTInvoiceTemplate;