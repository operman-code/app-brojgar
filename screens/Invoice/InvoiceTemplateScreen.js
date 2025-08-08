// screens/Invoice/InvoiceTemplateScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';

import InvoiceTemplateService from './services/InvoiceTemplateService';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const InvoiceTemplateScreen = ({ navigation, route }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [invoiceData, setInvoiceData] = useState(null);
  const [businessProfile, setBusinessProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Clean and professional design',
      preview: '📄',
      color: '#222',
      category: 'standard'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary layout with bold headers',
      preview: '🎨',
      color: '#10B981',
      category: 'standard'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant design',
      preview: '📋',
      color: '#444',
      category: 'standard'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional business template',
      preview: '🏢',
      color: '#666',
      category: 'standard'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated design with premium feel',
      preview: '✨',
      color: '#EC4899',
      category: 'standard'
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Modern tech company style',
      preview: '💻',
      color: '#6366F1',
      category: 'standard'
    },
    {
      id: 'retro',
      name: 'Retro',
      description: 'Vintage-inspired design',
      preview: '🕰️',
      color: '#DC2626',
      category: 'standard'
    },
    {
      id: 'gst-compliant',
      name: 'GST Compliant',
      description: 'GST-compliant invoice with tax details',
      preview: '🏛️',
      color: '#111',
      category: 'gst'
    },
    {
      id: 'thermal-80mm',
      name: 'Thermal 80mm',
      description: 'Standard thermal printer format',
      preview: '🧾',
      color: '#333',
      category: 'thermal'
    },
    {
      id: 'thermal-58mm',
      name: 'Thermal 58mm',
      description: 'Compact thermal printer format',
      preview: '🧾',
      color: '#7C3AED',
      category: 'thermal'
    },
    {
      id: 'thermal-receipt',
      name: 'Receipt Style',
      description: 'Traditional receipt format',
      preview: '🧾',
      color: '#EA580C',
      category: 'thermal'
    },
    {
      id: 'thermal-compact',
      name: 'Compact Thermal',
      description: 'Space-efficient thermal format',
      preview: '🧾',
      color: '#BE185D',
      category: 'thermal'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const passedInvoiceData = route.params?.invoiceData;
      if (!passedInvoiceData) {
        Alert.alert('Error', 'No invoice data found');
        navigation.goBack();
        return;
      }

      const [profile, invoiceDetails] = await Promise.all([
        InvoiceTemplateService.getBusinessProfile(),
        InvoiceTemplateService.getInvoiceById(passedInvoiceData.invoiceId)
      ]);

      setBusinessProfile(profile);
      setInvoiceData(invoiceDetails);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      Alert.alert(
        'Generate Invoice',
        'Choose an option:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Preview',
            onPress: () => handlePreview()
          },
          {
            text: 'Share PDF',
            onPress: () => handleSharePDF()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      Alert.alert('Error', 'Failed to generate invoice');
    }
  };

  const handlePreview = () => {
  console.log('🔄 Navigating to preview with:', {
    invoiceData: { invoiceId: invoiceData.id },
    selectedTemplate,
  });
  
  navigation.navigate('InvoicePreview', {
    invoiceData: {
      invoiceId: invoiceData.id
    },
    selectedTemplate,
  });
};

  const handleSharePDF = async () => {
    try {
      const result = await InvoiceTemplateService.generatePDF(
        invoiceData, 
        businessProfile, 
        selectedTemplate
      );
      
      if (result.success) {
        await Sharing.shareAsync(result.fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice ${invoiceData.invoice_number}`
        });
      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('❌ Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const renderTemplatePreview = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    const color = template?.color || '#222';

    if (!invoiceData) return null;

    const isThermal = template?.category === 'thermal';
    const isGST = template?.category === 'gst';
    const previewStyle = isThermal ? styles.thermalPreview : styles.invoicePreview;

    return (
      <View style={[previewStyle, { borderColor: color }]}>
        {/* Header */}
        <View style={[styles.previewHeader, { borderBottomColor: color }]}>
          <View style={styles.previewBusinessInfo}>
            <Text style={[styles.previewBusinessName, { color }]}>
              {businessProfile.name || 'Your Business'}
            </Text>
            <Text style={styles.previewBusinessDetails}>
              {businessProfile.address || 'Business Address'}
            </Text>
            <Text style={styles.previewBusinessDetails}>
              {businessProfile.phone || 'Phone'} • {businessProfile.email || 'Email'}
            </Text>
            {isGST && (
              <Text style={styles.previewBusinessDetails}>
                GSTIN: {businessProfile.gst_number || '27ABCDE1234F1Z5'}
              </Text>
            )}
          </View>
          <View style={styles.previewInvoiceInfo}>
            <Text style={[styles.previewInvoiceTitle, { color }]}>
              {isThermal ? 'RECEIPT' : isGST ? 'TAX INVOICE' : 'INVOICE'}
            </Text>
            <Text style={styles.previewInvoiceNumber}>
              #{invoiceData.invoice_number}
            </Text>
            <Text style={styles.previewDate}>
              {invoiceData.date}
            </Text>
            {isGST && (
              <Text style={styles.previewDate}>
                Place of Supply: {invoiceData.place_of_supply || 'Maharashtra'}
              </Text>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.previewSection}>
          <Text style={[styles.previewSectionTitle, { color }]}>
            {isThermal ? 'CUSTOMER' : 'Bill To:'}
          </Text>
          <Text style={styles.previewCustomerName}>
            {invoiceData.customer_name}
          </Text>
          <Text style={styles.previewDate}>
            {invoiceData.customer_phone || ''}
          </Text>
          {isGST && (
            <Text style={styles.previewDate}>
              GSTIN: {invoiceData.customer_gst_number || '29FGHIJ5678K2L6'}
            </Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.previewItems}>
          {isThermal ? (
            // Thermal format - compact
            <View>
              {invoiceData.items?.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.thermalItemRow}>
                  <Text style={styles.thermalItemName} numberOfLines={1}>
                    {item.item_name}
                  </Text>
                  <Text style={styles.thermalItemQty}>
                    {item.quantity}x{item.rate}
                  </Text>
                  <Text style={styles.thermalItemTotal}>
                    ₹{parseFloat(item.total).toFixed(2)}
                  </Text>
                </View>
              ))}
              {invoiceData.items?.length > 3 && (
                <Text style={styles.previewMoreItems}>
                  +{invoiceData.items.length - 3} more items
                </Text>
              )}
            </View>
          ) : isGST ? (
            // GST format - with tax details
            <View>
              <View style={[styles.previewItemsHeader, { backgroundColor: color + '20' }]}>
                <Text style={[styles.previewItemHeaderText, { color }]}>Item</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>HSN</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>Qty</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>Rate</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>Amount</Text>
              </View>
              {invoiceData.items?.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.previewItemRow}>
                  <Text style={styles.previewItemName} numberOfLines={1}>
                    {item.item_name}
                  </Text>
                  <Text style={styles.previewItemQty}>
                    {item.hsn_code || '8517'}
                  </Text>
                  <Text style={styles.previewItemQty}>
                    {item.quantity}
                  </Text>
                  <Text style={styles.previewItemQty}>
                    ₹{parseFloat(item.rate).toFixed(2)}
                  </Text>
                  <Text style={styles.previewItemAmount}>
                    ₹{parseFloat(item.total).toFixed(2)}
                  </Text>
                </View>
              ))}
              {invoiceData.items?.length > 3 && (
                <Text style={styles.previewMoreItems}>
                  +{invoiceData.items.length - 3} more items
                </Text>
              )}
            </View>
          ) : (
            // Standard format
            <View>
              <View style={[styles.previewItemsHeader, { backgroundColor: color + '20' }]}>
                <Text style={[styles.previewItemHeaderText, { color }]}>Item</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>Qty</Text>
                <Text style={[styles.previewItemHeaderText, { color }]}>Amount</Text>
              </View>
              {invoiceData.items?.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.previewItemRow}>
                  <Text style={styles.previewItemName} numberOfLines={1}>
                    {item.item_name}
                  </Text>
                  <Text style={styles.previewItemQty}>
                    {item.quantity}
                  </Text>
                  <Text style={styles.previewItemAmount}>
                    ₹{parseFloat(item.total).toFixed(2)}
                  </Text>
                </View>
              ))}
              {invoiceData.items?.length > 3 && (
                <Text style={styles.previewMoreItems}>
                  +{invoiceData.items.length - 3} more items
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Total */}
        <View style={[styles.previewTotal, { borderTopColor: color }]}>
          {isGST ? (
            // GST totals with tax breakdown
            <View>
              <View style={styles.previewTaxRow}>
                <Text style={styles.previewTaxLabel}>Subtotal:</Text>
                <Text style={styles.previewTaxValue}>₹{parseFloat(invoiceData.subtotal || invoiceData.total * 0.847).toFixed(2)}</Text>
              </View>
              <View style={styles.previewTaxRow}>
                <Text style={styles.previewTaxLabel}>CGST (9%):</Text>
                <Text style={styles.previewTaxValue}>₹{parseFloat(invoiceData.cgst_amount || invoiceData.total * 0.076).toFixed(2)}</Text>
              </View>
              <View style={styles.previewTaxRow}>
                <Text style={styles.previewTaxLabel}>SGST (9%):</Text>
                <Text style={styles.previewTaxValue}>₹{parseFloat(invoiceData.sgst_amount || invoiceData.total * 0.076).toFixed(2)}</Text>
              </View>
              <View style={[styles.previewTaxRow, styles.previewTotalRow]}>
                <Text style={[styles.previewTotalText, { color }]}>Total:</Text>
                <Text style={[styles.previewTotalText, { color }]}>₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.previewTotalText, { color }]}>
              Total: ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTemplateCard = (template) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        selectedTemplate === template.id && styles.selectedTemplateCard
      ]}
      onPress={() => setSelectedTemplate(template.id)}
    >
      <View style={[styles.templatePreview, { backgroundColor: template.color + '20' }]}>
        <Text style={[styles.templateIcon, { color: template.color }]}>
          {template.preview}
        </Text>
      </View>
      <View style={styles.templateInfo}>
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateDescription}>{template.description}</Text>
        <Text style={styles.templateCategory}>{template.category}</Text>
      </View>
      {selectedTemplate === template.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Templates</Text>
        <View />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Summary</Text>
          
          {invoiceData && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Invoice Number:</Text>
                <Text style={styles.summaryValue}>{invoiceData.invoice_number}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Customer:</Text>
                <Text style={styles.summaryValue}>{invoiceData.customer_name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>{invoiceData.date}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={[styles.summaryValue, styles.totalAmount]}>
                  ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items:</Text>
                <Text style={styles.summaryValue}>{invoiceData.items?.length || 0}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Template Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Template</Text>
          
          <View style={styles.templatesGrid}>
            {templates.map(renderTemplateCard)}
          </View>
        </View>

        {/* Template Preview */}
        <View style={styles.section}>
          <View style={styles.previewTitleContainer}>
            <Text style={styles.sectionTitle}>Live Preview</Text>
            <Text style={styles.previewSubtitle}>
              {templates.find(t => t.id === selectedTemplate)?.name} Template
            </Text>
          </View>
          
          <View style={styles.previewContainer}>
            {renderTemplatePreview(selectedTemplate)}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📄</Text>
              <Text style={styles.featureText}>Professional PDF generation</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureText}>Multiple themes and templates</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧾</Text>
              <Text style={styles.featureText}>Thermal printer support</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Mobile-friendly design</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔗</Text>
              <Text style={styles.featureText}>Easy sharing options</Text>
            </View>
            {selectedTemplate === 'gst-compliant' && (
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏛️</Text>
                <Text style={styles.featureText}>GST-compliant with tax breakdown</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateInvoice}
        >
          <Text style={styles.generateButtonText}>Generate Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 16,
    color: '#3B82F6',
  },
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  selectedTemplateCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  templatePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateIcon: {
    fontSize: 28,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  templateCategory: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewTitleContainer: {
    marginBottom: 16,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  previewContainer: {
    alignItems: 'center',
  },
  invoicePreview: {
    width: width - 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thermalPreview: {
    width: 280, // Standard thermal width
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 2,
    marginBottom: 12,
  },
  previewBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  previewBusinessDetails: {
    fontSize: 11,
    color: '#64748B',
  },
  previewInvoiceInfo: {
    alignItems: 'flex-end',
  },
  previewInvoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  previewInvoiceNumber: {
    fontSize: 12,
    color: '#64748B',
  },
  previewDate: {
    fontSize: 11,
    color: '#64748B',
  },
  previewSection: {
    marginBottom: 12,
  },
  previewSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  previewCustomerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  previewItems: {
    marginBottom: 12,
  },
  previewItemsHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  previewItemHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  previewItemRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  previewItemName: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
  },
  previewItemQty: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  previewItemAmount: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  thermalItemRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thermalItemName: {
    fontSize: 9,
    color: '#374151',
    flex: 2,
  },
  thermalItemQty: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  thermalItemTotal: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  previewMoreItems: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  previewTotal: {
    borderTopWidth: 2,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  previewTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewTaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewTaxLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  previewTaxValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  previewTotalRow: {
    marginTop: 8,
  },
});

export default InvoiceTemplateScreen;
