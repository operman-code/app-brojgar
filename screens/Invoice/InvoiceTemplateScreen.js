import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Share,
} from 'react-native';

const InvoiceTemplateScreen = ({ navigation, route }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const { invoiceData } = route.params;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (invoiceData.discount || 0)) / 100;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * (invoiceData.tax || 18)) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Invoice ${invoiceData.invoiceNumber} for ${invoiceData.customer.name} - Total: ₹${calculateTotal().toLocaleString()}`,
        title: 'Invoice Share',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'Invoice will be downloaded as PDF');
  };

  const handlePrint = () => {
    Alert.alert('Print', 'Invoice will be sent to printer');
  };

  const handleSave = () => {
    Alert.alert('Success', 'Invoice saved successfully!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice Preview</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Invoice Document */}
          <View style={styles.invoiceDocument}>
            {/* Business Header */}
            <View style={styles.businessHeader}>
              <View style={styles.businessLogo}>
                <Text style={styles.businessLogoText}>📱</Text>
              </View>
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>Your Business Name</Text>
                <Text style={styles.businessAddress}>123 Business Street</Text>
                <Text style={styles.businessAddress}>City, State 12345</Text>
                <Text style={styles.businessContact}>Phone: +91 99999 99999</Text>
                <Text style={styles.businessContact}>Email: info@yourbusiness.com</Text>
              </View>
            </View>

            {/* Invoice Title */}
            <View style={styles.invoiceTitle}>
              <Text style={styles.invoiceTitleText}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoiceData.invoiceNumber}</Text>
            </View>

            {/* Invoice Details */}
            <View style={styles.invoiceDetails}>
              <View style={styles.detailsLeft}>
                <Text style={styles.detailLabel}>Bill To:</Text>
                <Text style={styles.customerName}>{invoiceData.customer.name}</Text>
                <Text style={styles.customerDetails}>{invoiceData.customer.phone}</Text>
                <Text style={styles.customerDetails}>{invoiceData.customer.email}</Text>
              </View>
              <View style={styles.detailsRight}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice Date:</Text>
                  <Text style={styles.detailValue}>{invoiceData.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date:</Text>
                  <Text style={styles.detailValue}>{invoiceData.dueDate || 'Upon Receipt'}</Text>
                </View>
              </View>
            </View>

            {/* Items Table */}
            <View style={styles.itemsTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.itemColumn]}>Item</Text>
                <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
                <Text style={[styles.tableHeaderText, styles.priceColumn]}>Price</Text>
                <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
              </View>
              
              {/* Table Rows */}
              {invoiceData.items.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableText, styles.itemColumn]}>{item.name}</Text>
                  <Text style={[styles.tableText, styles.qtyColumn]}>{item.quantity}</Text>
                  <Text style={[styles.tableText, styles.priceColumn]}>₹{item.price.toLocaleString()}</Text>
                  <Text style={[styles.tableText, styles.totalColumn]}>₹{(item.quantity * item.price).toLocaleString()}</Text>
                </View>
              ))}
            </View>

            {/* Invoice Summary */}
            <View style={styles.invoiceSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>₹{calculateSubtotal().toLocaleString()}</Text>
              </View>
              {invoiceData.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({invoiceData.discount}%):</Text>
                  <Text style={styles.summaryValue}>-₹{calculateDiscount().toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({invoiceData.tax || 18}%):</Text>
                <Text style={styles.summaryValue}>₹{calculateTax().toLocaleString()}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>₹{calculateTotal().toLocaleString()}</Text>
              </View>
            </View>

            {/* Notes */}
            {invoiceData.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{invoiceData.notes}</Text>
              </View>
            )}

            {/* Terms */}
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Terms & Conditions:</Text>
              <Text style={styles.termsText}>
                {invoiceData.terms || 'Payment is due within 30 days. Late payments may incur additional charges.'}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.invoiceFooter}>
              <Text style={styles.footerText}>Thank you for your business!</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Text style={styles.actionIcon}>🖨️</Text>
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  invoiceDocument: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  businessLogoText: {
    fontSize: 28,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  businessContact: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  invoiceTitle: {
    alignItems: 'center',
    marginBottom: 32,
  },
  invoiceTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 4,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  detailsLeft: {
    flex: 1,
  },
  detailsRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  detailRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  itemsTable: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableText: {
    fontSize: 14,
    color: '#0f172a',
  },
  itemColumn: {
    flex: 2,
  },
  qtyColumn: {
    flex: 0.5,
    textAlign: 'center',
  },
  priceColumn: {
    flex: 1,
    textAlign: 'right',
  },
  totalColumn: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  invoiceSummary: {
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  termsSection: {
    marginBottom: 32,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  invoiceFooter: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default InvoiceTemplateScreen;