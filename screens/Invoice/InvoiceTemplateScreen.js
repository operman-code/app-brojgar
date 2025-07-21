// screens/Invoice/InvoiceTemplateScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
  Dimensions,
} from "react-native";

// Import service
import InvoiceService from "./services/InvoiceService";

const { width } = Dimensions.get('window');

const InvoiceTemplateScreen = ({ navigation, route }) => {
  const { invoiceData } = route.params;
  const [businessInfo, setBusinessInfo] = useState({});

  useEffect(() => {
    setBusinessInfo(InvoiceService.getBusinessInfo());
  }, []);

  const handlePrint = () => {
    Alert.alert(
      "Print Invoice",
      "Print functionality would be implemented here using a printing library",
      [{ text: "OK" }]
    );
  };

  const handleDownload = () => {
    const result = InvoiceService.generateInvoicePDF(invoiceData);
    Alert.alert(
      "Download Invoice",
      `Invoice saved to: ${result.filePath}`,
      [{ text: "OK" }]
    );
  };

  const handleShare = async () => {
    try {
      const shareData = InvoiceService.getShareData(invoiceData);
      await Share.share({
        title: shareData.title,
        message: shareData.message,
        url: shareData.url,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share invoice");
    }
  };

  const handleDone = () => {
    navigation.navigate("Dashboard");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const amountInWords = InvoiceService.convertAmountToWords(Math.floor(invoiceData.total));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.invoiceContainer}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.businessSection}>
              <Text style={styles.businessName}>{businessInfo.businessName}</Text>
              <Text style={styles.businessAddress}>{businessInfo.address}</Text>
              <Text style={styles.businessAddress}>{businessInfo.city}</Text>
              <Text style={styles.businessContact}>Phone: {businessInfo.phone}</Text>
              <Text style={styles.businessContact}>Email: {businessInfo.email}</Text>
              {businessInfo.gstNumber && (
                <Text style={styles.businessGst}>GST: {businessInfo.gstNumber}</Text>
              )}
            </View>
            
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceDetails}>
                <Text style={styles.invoiceNumber}>#{invoiceData.invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>Date: {formatDate(invoiceData.date)}</Text>
                <Text style={styles.invoiceDate}>Due: {formatDate(invoiceData.dueDate)}</Text>
              </View>
            </View>
          </View>

          {/* Bill To Section */}
          <View style={styles.billToSection}>
            <Text style={styles.billToTitle}>Bill To:</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{invoiceData.partyDetails.name}</Text>
              {invoiceData.partyDetails.address && (
                <Text style={styles.customerAddress}>{invoiceData.partyDetails.address}</Text>
              )}
              <Text style={styles.customerContact}>Phone: {invoiceData.partyDetails.phone}</Text>
              {invoiceData.partyDetails.email && (
                <Text style={styles.customerContact}>Email: {invoiceData.partyDetails.email}</Text>
              )}
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.itemsSection}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.itemColumn]}>Item</Text>
              <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.priceColumn]}>Price</Text>
              <Text style={[styles.tableHeaderText, styles.discountColumn]}>Disc.</Text>
              <Text style={[styles.tableHeaderText, styles.totalColumn]}>Amount</Text>
            </View>

            {/* Table Rows */}
            {invoiceData.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.itemColumn}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, styles.qtyColumn]}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={[styles.tableCell, styles.priceColumn]}>
                  ₹{item.price.toLocaleString("en-IN")}
                </Text>
                <Text style={[styles.tableCell, styles.discountColumn]}>
                  ₹{item.discount.toLocaleString("en-IN")}
                </Text>
                <Text style={[styles.tableCell, styles.totalColumn]}>
                  ₹{((item.quantity * item.price) - item.discount).toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{invoiceData.subtotal.toLocaleString("en-IN")}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoiceData.taxRate}%):</Text>
                <Text style={styles.totalValue}>₹{invoiceData.taxAmount.toLocaleString("en-IN")}</Text>
              </View>
              
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total Amount:</Text>
                <Text style={styles.grandTotalValue}>₹{invoiceData.total.toLocaleString("en-IN")}</Text>
              </View>
            </View>
            
            <View style={styles.amountInWords}>
              <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
              <Text style={styles.amountInWordsText}>{amountInWords}</Text>
            </View>
          </View>

          {/* Notes and Terms */}
          {(invoiceData.notes || invoiceData.termsConditions) && (
            <View style={styles.notesSection}>
              {invoiceData.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes:</Text>
                  <Text style={styles.notesText}>{invoiceData.notes}</Text>
                </View>
              )}
              
              {invoiceData.termsConditions && (
                <View style={styles.termsContainer}>
                  <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                  <Text style={styles.termsText}>{invoiceData.termsConditions}</Text>
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.invoiceFooter}>
            <Text style={styles.footerText}>Thank you for your business!</Text>
            <Text style={styles.footerContact}>
              For any queries, contact us at {businessInfo.phone} or {businessInfo.email}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Text style={styles.actionIcon}>🖨️</Text>
          <Text style={styles.actionText}>Print</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.doneButton]} onPress={handleDone}>
          <Text style={styles.doneIcon}>✓</Text>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  invoiceContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  businessSection: {
    flex: 1,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  businessContact: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  businessGst: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 4,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  invoiceDetails: {
    alignItems: "flex-end",
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  billToSection: {
    marginBottom: 32,
  },
  billToTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  customerInfo: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  customerAddress: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: 32,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemColumn: {
    flex: 3,
  },
  qtyColumn: {
    flex: 1,
    textAlign: "center",
  },
  priceColumn: {
    flex: 1.5,
    textAlign: "right",
  },
  discountColumn: {
    flex: 1.2,
    textAlign: "right",
  },
  totalColumn: {
    flex: 1.5,
    textAlign: "right",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  itemDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  tableCell: {
    fontSize: 14,
    color: "#374151",
  },
  totalsSection: {
    marginBottom: 32,
  },
  totalsContainer: {
    alignSelf: "flex-end",
    minWidth: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  amountInWords: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  amountInWordsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  amountInWordsText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  notesSection: {
    marginBottom: 32,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  invoiceFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 8,
  },
  footerContact: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  actionBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  doneButton: {
    backgroundColor: "#059669",
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  doneIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: "#ffffff",
  },
  doneText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default InvoiceTemplateScreen;
