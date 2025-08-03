// screens/Invoice/InvoicePreviewScreen.js
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
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

import InvoiceTemplateService from './services/InvoiceTemplateService';

const { width, height } = Dimensions.get('window');

const InvoicePreviewScreen = ({ navigation, route }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [businessProfile, setBusinessProfile] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedTheme, setSelectedTheme] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (invoiceData && businessProfile) {
      generatePreviewHTML();
    }
  }, [invoiceData, businessProfile, selectedTemplate, selectedTheme]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get parameters from route
      const passedInvoiceData = route.params?.invoiceData;
      const template = route.params?.selectedTemplate || 'classic';
      const theme = route.params?.selectedTheme || 'standard';
      
      console.log('📄 Preview Screen - Route params:', route.params);
      console.log('📄 Preview Screen - Invoice data:', passedInvoiceData);
      
      if (!passedInvoiceData) {
        Alert.alert('Error', 'No invoice data found');
        navigation.goBack();
        return;
      }

      setSelectedTemplate(template);
      setSelectedTheme(theme);

      const [profile, invoiceDetails] = await Promise.all([
        InvoiceTemplateService.getBusinessProfile(),
        InvoiceTemplateService.getInvoiceById(passedInvoiceData.invoiceId)
      ]);

      console.log('📄 Preview Screen - Invoice details:', invoiceDetails);

      setBusinessProfile(profile);
      setInvoiceData(invoiceDetails);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHTML = () => {
    try {
      console.log('🔄 Generating preview HTML with:', {
        template: selectedTemplate,
        theme: selectedTheme
      });
      
      const html = InvoiceTemplateService.generateHTML(
        invoiceData, 
        businessProfile, 
        selectedTemplate, 
        selectedTheme
      );
      setHtmlContent(html);
    } catch (error) {
      console.error('❌ Error generating preview HTML:', error);
    }
  };

  const handleSharePDF = async () => {
    try {
      setGenerating(true);
      
      const result = await InvoiceTemplateService.generatePDF(
        invoiceData, 
        businessProfile, 
        selectedTemplate,
        selectedTheme
      );
      
      if (result.success) {
        await Sharing.shareAsync(result.fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice ${invoiceData.invoice_number}`
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('❌ Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setGenerating(true);
      
      const result = await InvoiceTemplateService.generatePDF(
        invoiceData, 
        businessProfile, 
        selectedTemplate,
        selectedTheme
      );
      
      if (result.success) {
        await Print.printAsync({
          uri: result.fileUri,
          printerUrl: undefined
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to generate PDF for printing');
      }
    } catch (error) {
      console.error('❌ Error printing:', error);
      Alert.alert('Error', 'Failed to print invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setGenerating(true);
      
      const result = await InvoiceTemplateService.generatePDF(
        invoiceData, 
        businessProfile, 
        selectedTemplate,
        selectedTheme
      );
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Invoice saved successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('❌ Error saving:', error);
      Alert.alert('Error', 'Failed to save invoice');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Invoice Preview...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('InvoiceTemplate', route.params)}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <View />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleSharePDF}
          disabled={generating}
        >
          <Text style={styles.actionButtonText}>
            {generating ? 'Generating...' : 'Share PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrint}
          disabled={generating}
        >
          <Text style={styles.actionButtonText}>
            {generating ? 'Generating...' : 'Print'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
          disabled={generating}
        >
          <Text style={styles.actionButtonText}>
            {generating ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Container */}
      <View style={styles.previewContainer}>
        {htmlContent ? (
          <WebView
            source={{ html: htmlContent }}
            style={styles.webview}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.webviewLoadingText}>Loading Preview...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.webviewLoadingText}>Generating Preview...</Text>
          </View>
        )}
      </View>

      {/* Template Info */}
      <View style={styles.templateInfo}>
        <Text style={styles.templateInfoText}>
          Template: {selectedTemplate} • Theme: {selectedTheme}
        </Text>
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
    marginTop: 16,
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
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
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
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  webviewLoadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  templateInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  templateInfoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default InvoicePreviewScreen;
