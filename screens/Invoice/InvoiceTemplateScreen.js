// screens/Invoice/InvoiceTemplateScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Import services
import InvoiceService from "./services/InvoiceService";

const { width } = Dimensions.get('window');

const InvoiceTemplateScreen = ({ navigation, route }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      const { invoiceId, invoiceData } = route.params || {};
      
      if (invoiceData) {
        // Live preview mode - use provided data
        setInvoice(invoiceData);
      } else if (invoiceId) {
        // View saved invoice mode
        const invoiceDetails = await InvoiceService.getInvoiceById(invoiceId);
        setInvoice(invoiceDetails);
      } else {
        Alert.alert("Error", "No invoice data provided");
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.error('❌ Error loading invoice:', error);
      Alert.alert("Error", "Failed to load invoice");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceHTML = (invoiceData) => {
    const subtotal = invoiceData.subtotal || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const discountAmount = invoiceData.discountAmount || 0;
    const total = invoiceData.total || 0;
    
    const amountInWords = InvoiceService.numberToWords(Math.floor(total));

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                font-size: 14px; 
                line-height: 1.4; 
                color: #333;
                background: #fff;
            }
            .invoice-container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                border: 1px solid #ddd;
            }
            .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 3px solid #3B82F6;
                padding-bottom: 20px;
            }
            .company-info h1 { 
                color: #3B82F6; 
                font-size: 28px; 
                margin-bottom: 5px;
                font-weight: bold;
            }
            .company-info p { 
                color: #666; 
                margin: 2px 0; 
                font-size: 13px;
            }
            .invoice-title { 
                text-align: right; 
            }
            .invoice-title h2 { 
                color: #333; 
                font-size: 32px; 
                margin-bottom: 10px;
                font-weight: bold;
            }
            .invoice-number { 
                background: #3B82F6; 
                color: white; 
                padding: 8px 16px; 
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }
            .invoice-details { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px;
            }
            .bill-to, .invoice-info { 
                width: 48%; 
            }
            .bill-to h3, .invoice-info h3 { 
                color: #3B82F6; 
                margin-bottom: 10px;
                font-size: 16px;
                font-weight: bold;
            }
            .bill-to p, .invoice-info p { 
                margin: 3px 0; 
                color: #555;
            }
            .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 30px;
                border: 1px solid #ddd;
            }
            .items-table th { 
                background: #f8f9fa; 
                padding: 12px 8px; 
                text-align: left; 
                border-bottom: 2px solid #ddd;
                font-weight: bold;
                color: #333;
                font-size: 13px;
            }
            .items-table td { 
                padding: 10px 8px; 
                border-bottom: 1px solid #eee;
                vertical-align: top;
            }
            .items-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section { 
                display: flex; 
                justify-content: flex-end; 
                margin-bottom: 30px;
            }
            .totals-table { 
                width: 300px; 
                border-collapse: collapse;
            }
            .totals-table td { 
                padding: 8px 12px; 
                border-bottom: 1px solid #eee;
            }
            .totals-table .label { 
                font-weight: 500; 
                color: #666;
            }
            .totals-table .amount { 
                text-align: right; 
                font-weight: bold;
                color: #333;
            }
            .total-row { 
                background: #f8f9fa; 
                border-top: 2px solid #3B82F6;
                border-bottom: 2px solid #3B82F6;
            }
            .total-row .amount { 
                color: #3B82F6; 
                font-size: 18px;
                font-weight: bold;
            }
            .amount-words { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px; 
                margin-bottom: 20px;
                border-left: 4px solid #3B82F6;
            }
            .amount-words strong { 
                color: #3B82F6; 
            }
            .footer { 
                border-top: 2px solid #eee; 
                padding-top: 20px;
                margin-top: 30px;
            }
            .footer-section { 
                margin-bottom: 15px; 
            }
            .footer-section h4 { 
                color: #3B82F6; 
                margin-bottom: 8px;
                font-size: 14px;
            }
            .footer-section p { 
                color: #666; 
                font-size: 12px;
                line-height: 1.5;
            }
            .thank-you { 
                text-align: center; 
                color: #3B82F6; 
                font-size: 18px; 
                font-weight: bold;
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            @media print {
                .invoice-container { 
                    border: none; 
                    padding: 0;
                    max-width: none;
                }
                body { font-size: 12px; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <h1>Brojgar Business</h1>
                    <p><strong>Address:</strong> Shop No. 45, Block A, Connaught Place</p>
                    <p>New Delhi - 110001, India</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Email:</strong> contact@brojgar.com</p>
                    <p><strong>GST No:</strong> 07ABCDE1234F1Z5</p>
                </div>
                <div class="invoice-title">
                    <h2>INVOICE</h2>
                    <div class="invoice-number">${invoiceData.invoiceNumber}</div>
                </div>
            </div>

            <!-- Invoice Details -->
            <div class="invoice-details">
                <div class="bill-to">
                    <h3>BILL TO:</h3>
                    <p><strong>${invoiceData.partyDetails?.name || 'Customer Name'}</strong></p>
                    ${invoiceData.partyDetails?.address ? `<p>${invoiceData.partyDetails.address}</p>` : ''}
                    ${invoiceData.partyDetails?.phone ? `<p><strong>Phone:</strong> ${invoiceData.partyDetails.phone}</p>` : ''}
                    ${invoiceData.partyDetails?.email ? `<p><strong>Email:</strong> ${invoiceData.partyDetails.email}</p>` : ''}
                    ${invoiceData.partyDetails?.gstNumber ? `<p><strong>GST No:</strong> ${invoiceData.partyDetails.gstNumber}</p>` : ''}
                </div>
                <div class="invoice-info">
                    <h3>INVOICE DETAILS:</h3>
                    <p><strong>Invoice Date:</strong> ${new Date(invoiceData.date).toLocaleDateString('en-IN')}</p>
                    <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString('en-IN')}</p>
                    <p><strong>Payment Terms:</strong> ${invoiceData.terms || 'Net 30 days'}</p>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">#</th>
                        <th style="width: 35%;">Item Description</th>
                        <th style="width: 10%;" class="text-center">Qty</th>
                        <th style="width: 12%;" class="text-right">Rate</th>
                        <th style="width: 12%;" class="text-right">Discount</th>
                        <th style="width: 10%;" class="text-center">Tax%</th>
                        <th style="width: 13%;" class="text-right">Amount</th>
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

            <!-- Totals -->
            <div class="totals-section">
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
                        <td class="label"><strong>TOTAL:</strong></td>
                        <td class="amount">₹${total.toLocaleString('en-IN')}</td>
                    </tr>
                </table>
            </div>

            <!-- Amount in Words -->
            <div class="amount-words">
                <strong>Amount in Words:</strong> ${amountInWords}
            </div>

            <!-- Footer -->
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
                    <p>Please make payment to: Brojgar Business<br>
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
  };

  const generatePDF = async () => {
    if (!invoice) return;

    setGenerating(true);
    try {
      const htmlContent = generateInvoiceHTML(invoice);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      const fileName = `Invoice_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      return { uri: newUri, fileName };
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const result = await generatePDF();
      
      Alert.alert(
        "Share Invoice",
        "How would you like to share this invoice?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share PDF",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(result.uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: `Share ${result.fileName}`,
                });
              } else {
                // Fallback to React Native Share
                await Share.share({
                  url: result.uri,
                  title: `Invoice ${invoice.invoiceNumber}`,
                  message: `Please find attached invoice ${invoice.invoiceNumber} for ₹${invoice.total.toLocaleString('en-IN')}`,
                });
              }
            }
          },
          {
            text: "Send via WhatsApp",
            onPress: async () => {
              const message = `Hi! Please find your invoice ${invoice.invoiceNumber} for ₹${invoice.total.toLocaleString('en-IN')}. Thank you for your business! 🙏`;
              const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
              
              try {
                await Share.share({
                  url: result.uri,
                  title: `Invoice ${invoice.invoiceNumber}`,
                  message: message,
                });
              } catch (error) {
                Alert.alert("Info", "Please select WhatsApp from the sharing options");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error sharing invoice:', error);
      Alert.alert("Error", "Failed to generate or share invoice");
    }
  };

  const handlePrint = async () => {
    try {
      const htmlContent = generateInvoiceHTML(invoice);
      
      await Print.printAsync({
        html: htmlContent,
        printerUrl: undefined, // Let user select printer
      });
    } catch (error) {
      console.error('❌ Error printing invoice:', error);
      Alert.alert("Error", "Failed to print invoice");
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // If this is a live preview, save the invoice
      if (route.params?.invoiceData && !invoice.id) {
        const result = await InvoiceService.createInvoice({
          ...invoice,
          status: 'draft'
        });
        
        if (result.success) {
          Alert.alert("Success", "Invoice saved as draft");
          navigation.navigate('Invoice'); // Go back to create new invoice
        } else {
          Alert.alert("Error", result.error);
        }
      } else {
        Alert.alert("Info", "Invoice is already saved");
      }
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      Alert.alert("Error", "Failed to save invoice");
    }
  };

  const handleMarkAsSent = async () => {
    try {
      if (invoice.id) {
        await InvoiceService.updateInvoiceStatus(invoice.id, 'sent');
        Alert.alert("Success", "Invoice marked as sent");
        setInvoice(prev => ({ ...prev, status: 'sent' }));
      }
    } catch (error) {
      console.error('❌ Error updating invoice status:', error);
      Alert.alert("Error", "Failed to update invoice status");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.taxAmount || 0;
  const discountAmount = invoice.discountAmount || 0;
  const total = invoice.total || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={styles.headerButtonText}>↑ Top</Text>
        </TouchableOpacity>
      </View>

      {/* Invoice Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.invoiceContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Brojgar Business</Text>
            <Text style={styles.companyDetail}>Shop No. 45, Block A, Connaught Place</Text>
            <Text style={styles.companyDetail}>New Delhi - 110001, India</Text>
            <Text style={styles.companyDetail}>Phone: +91 98765 43210</Text>
            <Text style={styles.companyDetail}>Email: contact@brojgar.com</Text>
            <Text style={styles.companyDetail}>GST No: 07ABCDE1234F1Z5</Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceTitleText}>INVOICE</Text>
            <View style={styles.invoiceNumberBadge}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>BILL TO:</Text>
            <Text style={styles.customerName}>{invoice.partyDetails?.name || 'Customer Name'}</Text>
            {invoice.partyDetails?.address && (
              <Text style={styles.customerDetail}>{invoice.partyDetails.address}</Text>
            )}
            {invoice.partyDetails?.phone && (
              <Text style={styles.customerDetail}>Phone: {invoice.partyDetails.phone}</Text>
            )}
            {invoice.partyDetails?.email && (
              <Text style={styles.customerDetail}>Email: {invoice.partyDetails.email}</Text>
            )}
            {invoice.partyDetails?.gstNumber && (
              <Text style={styles.customerDetail}>GST No: {invoice.partyDetails.gstNumber}</Text>
            )}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.sectionTitle}>INVOICE DETAILS:</Text>
            <Text style={styles.invoiceDetailText}>
              Invoice Date: {new Date(invoice.date).toLocaleDateString('en-IN')}
            </Text>
            <Text style={styles.invoiceDetailText}>
              Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
            </Text>
            <Text style={styles.invoiceDetailText}>
              Payment Terms: {invoice.terms || 'Net 30 days'}
            </Text>
            {invoice.status && (
              <View style={[styles.statusBadge, { 
                backgroundColor: invoice.status === 'paid' ? '#10B981' : 
                                invoice.status === 'sent' ? '#3B82F6' : 
                                invoice.status === 'overdue' ? '#EF4444' : '#F59E0B' 
              }]}>
                <Text style={styles.statusText}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>ITEMS:</Text>
          <View style={styles.itemsTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Description</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Rate</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Amount</Text>
            </View>
            
            {/* Table Rows */}
            {(invoice.items || []).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellText, { flex: 0.8 }]}>{index + 1}</Text>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.tableCellText, { flex: 1 }]}>
                  {item.quantity} {item.unit || 'pcs'}
                </Text>
                <Text style={[styles.tableCellText, { flex: 1.2 }]}>
                  ₹{item.price.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.tableCellText, { flex: 1.2, fontWeight: 'bold' }]}>
                  ₹{item.total.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={[styles.totalValue, { color: '#EF4444' }]}>
                  -₹{discountAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate || 18}%):</Text>
              <Text style={styles.totalValue}>₹{taxAmount.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.amountWordsSection}>
          <Text style={styles.amountWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountWordsText}>
            {InvoiceService.numberToWords(Math.floor(total))}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          {invoice.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesSectionTitle}>Notes:</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}
          
          <View style={styles.termsSection}>
            <Text style={styles.termsSectionTitle}>Terms & Conditions:</Text>
            <Text style={styles.termsText}>
              {invoice.terms || 'Payment due within 30 days. Late payments may incur additional charges.'}
            </Text>
          </View>

          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouText}>Thank You for Your Business! 🙏</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={generating}
        >
          <Text style={styles.actionButtonText}>
            {generating ? "Generating..." : "📤 Share"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrint}
        >
          <Text style={styles.actionButtonText}>🖨️ Print</Text>
        </TouchableOpacity>
        
        {!invoice.id && (
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveAsDraft}
          >
            <Text style={styles.actionButtonText}>💾 Save</Text>
          </TouchableOpacity>
        )}
        
        {invoice.id && invoice.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.sentButton]}
            onPress={handleMarkAsSent}
          >
            <Text style={styles.actionButtonText}>✅ Mark Sent</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  invoiceContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  companyDetail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  invoiceTitle: {
    alignItems: 'flex-end',
  },
  invoiceTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  invoiceNumberBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  invoiceNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  billTo: {
    flex: 1,
    marginRight: 20,
  },
  invoiceInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  invoiceDetailText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemsTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 13,
    color: '#64748B',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  totalsSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  totalsTable: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  grandTotalRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  amountWordsSection: {
    backgroundColor: '#F8FAFC',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  amountWordsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  amountWordsText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  footerSection: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  thankYouSection: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  thankYouText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
  },
  printButton: {
    backgroundColor: '#10B981',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
  },
  sentButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default InvoiceTemplateScreen;
