// screens/Invoice/components/InvoiceTemplateSelector.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const InvoiceTemplateSelector = ({ visible, onClose, onSelectTemplate, currentTemplate = 'professional' }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and modern design with company branding',
      color: '#3b82f6',
      features: ['Company Logo', 'Clean Layout', 'Professional Colors']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant with minimal design elements',
      color: '#6b7280',
      features: ['Minimalist Design', 'Easy to Read', 'Space Efficient']
    },
    {
      id: 'colorful',
      name: 'Colorful',
      description: 'Vibrant design with modern colors and gradients',
      color: '#8b5cf6',
      features: ['Gradient Header', 'Colorful Accents', 'Modern Layout']
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional business invoice with formal styling',
      color: '#1f2937',
      features: ['Traditional Format', 'Business Formal', 'Time Tested']
    }
  ];

  const handleSelectTemplate = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  const renderTemplateCard = (template) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <TouchableOpacity
        key={template.id}
        style={[
          styles.templateCard,
          isSelected && styles.selectedCard,
          { borderColor: template.color }
        ]}
        onPress={() => setSelectedTemplate(template.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.previewContainer, { backgroundColor: template.color + '10' }]}>
          <View style={[styles.previewHeader, { backgroundColor: template.color }]}>
            <View style={styles.previewLogo} />
            <View style={styles.previewTitle} />
          </View>
          <View style={styles.previewContent}>
            <View style={styles.previewLine} />
            <View style={styles.previewLine} />
            <View style={[styles.previewLine, { width: '60%' }]} />
          </View>
          <View style={styles.previewTable}>
            <View style={styles.previewRow} />
            <View style={styles.previewRow} />
            <View style={styles.previewRow} />
          </View>
          <View style={[styles.previewTotal, { backgroundColor: template.color }]} />
        </View>
        
        <View style={styles.templateInfo}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateName}>{template.name}</Text>
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: template.color }]}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.templateDescription}>{template.description}</Text>
          
          <View style={styles.featuresContainer}>
            {template.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Invoice Template</Text>
          <TouchableOpacity onPress={handleSelectTemplate} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Choose a template that best represents your business style
          </Text>
          
          <View style={styles.templatesGrid}>
            {templates.map(renderTemplateCard)}
          </View>
          
          <View style={styles.customizeSection}>
            <Text style={styles.customizeTitle}>💡 Customization Options</Text>
            <Text style={styles.customizeText}>
              All templates can be customized with your business logo, colors, and branding. 
              You can modify layouts, add custom fields, and adjust styling to match your brand.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 3,
  },
  previewContainer: {
    height: 160,
    padding: 12,
    position: 'relative',
  },
  previewHeader: {
    height: 24,
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  previewLogo: {
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  previewTitle: {
    width: 60,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  previewContent: {
    marginBottom: 12,
  },
  previewLine: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 1,
    marginBottom: 4,
    width: '80%',
  },
  previewTable: {
    flex: 1,
    gap: 4,
  },
  previewRow: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 1,
  },
  previewTotal: {
    height: 12,
    borderRadius: 2,
    width: '40%',
    alignSelf: 'flex-end',
  },
  templateInfo: {
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  customizeSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  customizeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  customizeText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default InvoiceTemplateSelector;