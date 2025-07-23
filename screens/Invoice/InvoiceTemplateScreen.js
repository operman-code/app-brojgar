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

// Import services and components
import InvoiceService from "./services/InvoiceService";
import InvoiceTemplateGenerator from "./services/InvoiceTemplateGenerator";
import InvoiceTemplateSelector from "./components/InvoiceTemplateSelector";

const { width } = Dimensions.get('window');

const InvoiceTemplateScreen = ({ navigation, route }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
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
      Alert.alert("Error", "Failed to load invoice data");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!invoice) return;

    setGenerating(true);
    try {
      const htmlContent = InvoiceTemplateGenerator.generateTemplate(selectedTemplate, invoice);
      
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

      Alert.alert(
        "PDF Generated",
        `Invoice saved as ${fileName}`,
        [
          {
            text: "Share",
            onPress: () => sharePDF(newUri),
          },
          {
            text: "OK",
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const sharePDF = async (uri) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        // Fallback to React Native Share
        await Share.share({
          url: uri,
          title: `Invoice ${invoice.invoiceNumber}`,
        });
      }
    } catch (error) {
      console.error('❌ Error sharing PDF:', error);
      Alert.alert("Error", "Failed to share PDF");
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setShowTemplateSelector(false);
  };

  const handlePreview = () => {
    const htmlContent = InvoiceTemplateGenerator.generateTemplate(selectedTemplate, invoice);
    
    // Open preview in print dialog
    Print.printAsync({
      html: htmlContent,
      margins: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 20,
      },
    });
  };

  const getTemplateDisplayName = (templateId) => {
    const templates = {
      'professional': 'Professional',
      'minimal': 'Minimal',
      'colorful': 'Colorful',
      'classic': 'Classic'
    };
    return templates[templateId] || 'Professional';
  };

  const getTemplateColor = (templateId) => {
    const colors = {
      'professional': '#3b82f6',
      'minimal': '#6b7280',
      'colorful': '#8b5cf6',
      'classic': '#1f2937'
    };
    return colors[templateId] || '#3b82f6';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        
        <TouchableOpacity 
          style={styles.templateButton}
          onPress={() => setShowTemplateSelector(true)}
        >
          <Text style={styles.templateButtonText}>Templates</Text>
        </TouchableOpacity>
      </View>

      {/* Template Selector */}
      <View style={styles.templateSelectorContainer}>
        <TouchableOpacity 
          style={[styles.templateTag, { backgroundColor: getTemplateColor(selectedTemplate) }]}
          onPress={() => setShowTemplateSelector(true)}
        >
          <Text style={styles.templateTagText}>
            {getTemplateDisplayName(selectedTemplate)} Template
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.templateHint}>Tap to change template</Text>
      </View>

      {/* Invoice Preview */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.previewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.invoicePreview}>
          <InvoicePreviewComponent 
            invoice={invoice} 
            templateId={selectedTemplate} 
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.previewButton]}
          onPress={handlePreview}
        >
          <Text style={styles.previewButtonText}>🔍 Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.generateButton]}
          onPress={generatePDF}
          disabled={generating}
        >
          <Text style={styles.generateButtonText}>
            {generating ? '⏳ Generating...' : '📄 Generate PDF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Template Selector Modal */}
      <InvoiceTemplateSelector
        visible={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateChange}
        currentTemplate={selectedTemplate}
      />
    </SafeAreaView>
  );
};

// Invoice Preview Component
const InvoicePreviewComponent = ({ invoice, templateId }) => {
  const getPreviewData = () => {
    return {
      invoiceNumber: invoice.invoiceNumber || 'INV-001',
      invoiceDate: invoice.invoiceDate || new Date().toLocaleDateString('en-IN'),
      dueDate: invoice.dueDate || 'N/A',
      businessName: invoice.businessName || 'Brojgar Business',
      businessAddress: invoice.businessAddress || 'Business Address',
      businessCity: invoice.businessCity || 'City',
      businessState: invoice.businessState || 'State',
      businessPincode: invoice.businessPincode || 'Pincode',
      businessGST: invoice.businessGST || 'GST Number',
      businessPhone: invoice.businessPhone || 'Phone Number',
      businessEmail: invoice.businessEmail || 'email@business.com',
      customerName: invoice.customerName || 'Customer Name',
      customerAddress: invoice.customerAddress || 'Customer Address',
      customerCity: invoice.customerCity || 'City',
      customerState: invoice.customerState || 'State',
      customerPincode: invoice.customerPincode || 'Pincode',
      customerPhone: invoice.customerPhone || 'Phone Number',
      customerEmail: invoice.customerEmail || 'Email',
      items: invoice.items || [
        {
          name: 'Sample Product 1',
          description: 'High quality product description',
          quantity: 2,
          unit: 'pcs',
          price: 1500,
          discount: 0,
          taxRate: 18,
          total: 3000
        },
        {
          name: 'Sample Product 2', 
          description: 'Another great product',
          quantity: 1,
          unit: 'pcs',
          price: 2500,
          discount: 250,
          taxRate: 18,
          total: 2250
        }
      ],
      subtotal: invoice.subtotal || 5250,
      discountAmount: invoice.discountAmount || 250,
      taxAmount: invoice.taxAmount || 900,
      total: invoice.total || 5900,
      notes: invoice.notes || 'Thank you for your business!',
      terms: invoice.terms || 'Payment due within 30 days.'
    };
  };

  const previewData = getPreviewData();
  
  return (
    <View style={styles.previewContent}>
      {/* Header Preview */}
      <View style={[styles.previewHeader, { backgroundColor: getTemplateHeaderColor(templateId) }]}>
        <View style={styles.previewHeaderContent}>
          <Text style={styles.previewInvoiceTitle}>INVOICE</Text>
          <Text style={styles.previewInvoiceNumber}>#{previewData.invoiceNumber}</Text>
        </View>
        <Text style={styles.previewBusinessName}>{previewData.businessName}</Text>
      </View>

      {/* Business Info Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewRow}>
          <View style={styles.previewColumn}>
            <Text style={styles.previewSectionTitle}>FROM:</Text>
            <Text style={styles.previewBusinessName}>{previewData.businessName}</Text>
            <Text style={styles.previewText}>{previewData.businessAddress}</Text>
            <Text style={styles.previewText}>{previewData.businessCity}, {previewData.businessState}</Text>
            <Text style={styles.previewText}>GST: {previewData.businessGST}</Text>
          </View>
          
          <View style={styles.previewColumn}>
            <Text style={styles.previewSectionTitle}>BILL TO:</Text>
            <Text style={styles.previewCustomerName}>{previewData.customerName}</Text>
            <Text style={styles.previewText}>{previewData.customerAddress}</Text>
            <Text style={styles.previewText}>{previewData.customerCity}, {previewData.customerState}</Text>
          </View>
        </View>
      </View>

      {/* Items Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.previewSectionTitle}>Items:</Text>
        {previewData.items.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.previewItem}>
            <View style={styles.previewItemHeader}>
              <Text style={styles.previewItemName}>{item.name}</Text>
              <Text style={styles.previewItemAmount}>₹{item.total.toLocaleString('en-IN')}</Text>
            </View>
            <Text style={styles.previewItemDetails}>
              {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>

      {/* Total Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewTotalRow}>
          <Text style={styles.previewTotalLabel}>Subtotal:</Text>
          <Text style={styles.previewTotalAmount}>₹{previewData.subtotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.previewTotalRow}>
          <Text style={styles.previewTotalLabel}>Tax:</Text>
          <Text style={styles.previewTotalAmount}>₹{previewData.taxAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.previewTotalRow, styles.previewGrandTotal]}>
          <Text style={styles.previewGrandTotalLabel}>TOTAL:</Text>
          <Text style={[styles.previewGrandTotalAmount, { color: getTemplateHeaderColor(templateId) }]}>
            ₹{previewData.total.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.previewFooter}>
        <Text style={styles.previewFooterText}>
          This is a preview of your {getTemplateDisplayName(templateId)} template
        </Text>
      </View>
    </View>
  );
};

const getTemplateHeaderColor = (templateId) => {
  const colors = {
    'professional': '#3b82f6',
    'minimal': '#6b7280', 
    'colorful': '#8b5cf6',
    'classic': '#1f2937'
  };
  return colors[templateId] || '#3b82f6';
};

const getTemplateDisplayName = (templateId) => {
  const templates = {
    'professional': 'Professional',
    'minimal': 'Minimal',
    'colorful': 'Colorful',
    'classic': 'Classic'
  };
  return templates[templateId] || 'Professional';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  templateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  templateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  templateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  templateTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  templateTagText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  templateHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  invoicePreview: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewContent: {
    padding: 20,
  },
  previewHeader: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewHeaderContent: {
    marginBottom: 10,
  },
  previewInvoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  previewInvoiceNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  previewBusinessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewColumn: {
    flex: 1,
    marginRight: 20,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  previewCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  previewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  previewItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  previewItemDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  previewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewTotalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewTotalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  previewGrandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  previewGrandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  previewGrandTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewFooter: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
  },
  previewFooterText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  previewButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InvoiceTemplateScreen;