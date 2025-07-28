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
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>
                {templates.find(t => t.id === selectedTemplate)?.name} Template
              </Text>
              <Text style={styles.previewDescription}>
                {templates.find(t => t.id === selectedTemplate)?.description}
              </Text>
              
              <View style={styles.previewMockup}>
                <View style={styles.mockupHeader}>
                  <View style={styles.mockupLine} />
                  <View style={[styles.mockupLine, styles.mockupLineShort]} />
                </View>
                <View style={styles.mockupBody}>
                  <View style={styles.mockupLine} />
                  <View style={styles.mockupLine} />
                  <View style={[styles.mockupLine, styles.mockupLineShort]} />
                </View>
                <View style={styles.mockupFooter}>
                  <View style={[styles.mockupLine, styles.mockupLineShort]} />
                </View>
              </View>
            </View>
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
  previewContainer: {
    alignItems: 'center',
  },
  previewCard: {
    width: width - 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewMockup: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
  },
  mockupHeader: {
    marginBottom: 16,
  },
  mockupBody: {
    marginBottom: 16,
  },
  mockupFooter: {
    marginBottom: 0,
  },
  mockupLine: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  mockupLineShort: {
    width: '60%',
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
