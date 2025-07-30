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
      color: '#3B82F6'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary layout with bold headers',
      preview: '🎨',
      color: '#10B981'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant design',
      preview: '📋',
      color: '#8B5CF6'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional business template',
      preview: '🏢',
      color: '#F59E0B'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get invoice data from navigation params
      const passedInvoiceData = route.params?.invoiceData;
      if (!passedInvoiceData) {
        Alert.alert('Error', 'No invoice data found');
        navigation.goBack();
        return;
      }

      // Load business profile and invoice details
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
    navigation.navigate('InvoicePreview', {
      invoiceData,
      businessProfile,
      template: selectedTemplate
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
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.fileUri);
        } else {
          Alert.alert('Success', 'PDF generated successfully');
        }
      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('❌ Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const renderTemplatePreview = (templateId) => {
    if (!invoiceData || !businessProfile) return null;

    const templateColors = {
      classic: '#3B82F6',
      modern: '#10B981', 
      minimal: '#8B5CF6',
      corporate: '#F59E0B'
    };

    const color = templateColors[templateId] || '#3B82F6';

    return (
      <View style={styles.invoicePreview}>
        {/* Header */}
        <View style={[styles.previewHeader, { borderBottomColor: color }]}>
          <View>
            <Text style={[styles.previewBusinessName, { color }]}>
              {businessProfile.business_name || 'Brojgar Business'}
            </Text>
<Text style={styles.previewBusinessDetails}>
              {businessProfile.business_email || 'info@brojgar.com'}
            </Text>
          </View>
          <View style={styles.previewInvoiceInfo}>
            <Text style={[styles.previewInvoiceTitle, { color }]}>INVOICE</Text>
            <Text style={styles.previewInvoiceNumber}>#{invoiceData.invoice_number}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>Bill To:</Text>
          <Text style={styles.previewCustomerName}>{invoiceData.customer_name}</Text>
          <Text style={styles.previewDate}>Date: {invoiceData.date}</Text>
        </View>

        {/* Items */}
        <View style={styles.previewItems}>
          <View style={[styles.previewItemsHeader, { backgroundColor: color + '10' }]}>
            <Text style={[styles.previewItemHeaderText, { color }]}>Item</Text>
            <Text style={[styles.previewItemHeaderText, { color }]}>Qty</Text>
            <Text style={[styles.previewItemHeaderText, { color }]}>Amount</Text>
          </View>
          {invoiceData.items?.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.previewItemRow}>
            <Text style={styles.previewItemName}>{item.item_name?.substring(0, 12)}...</Text>
              <Text style={styles.previewItemQty}>{item.quantity}</Text>
              <Text style={styles.previewItemAmount}>₹{item.total}</Text>
            </View>
          ))}
          {invoiceData.items?.length > 2 && (
            <Text style={styles.previewMoreItems}>+{invoiceData.items.length - 2} more items</Text>
          )}
        </View>

        {/* Total */}
        <View style={[styles.previewTotal, { borderTopColor: color }]}>
          <Text style={[styles.previewTotalText, { color }]}>
            Total: ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
          </Text>
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Templates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
              <Text style={styles.featureText}>Customizable branding</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Mobile-friendly design</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔗</Text>
              <Text style={styles.featureText}>Easy sharing options</Text>
            </View>
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
  previewDate: {
    fontSize: 11,
    color: '#64748B',
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
});

export default InvoiceTemplateScreen;
