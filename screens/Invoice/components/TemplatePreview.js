// screens/Invoice/components/TemplatePreview.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const TemplatePreview = ({ template, theme, invoiceData, businessProfile, isThermal = false }) => {
  const getTemplateStyles = () => {
    const baseColor = template.color || '#3B82F6';
    
    if (isThermal) {
      return {
        container: {
          width: 280,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: baseColor,
        },
        header: {
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          paddingBottom: 8,
          marginBottom: 8,
        },
        businessName: {
          fontSize: 12,
          fontWeight: 'bold',
          color: baseColor,
          marginBottom: 2,
        },
        businessDetails: {
          fontSize: 8,
          color: '#6B7280',
        },
        receiptTitle: {
          fontSize: 10,
          fontWeight: 'bold',
          color: baseColor,
          marginBottom: 2,
        },
        invoiceNumber: {
          fontSize: 8,
          color: '#6B7280',
        },
        customerSection: {
          marginBottom: 8,
        },
        customerTitle: {
          fontSize: 8,
          fontWeight: 'bold',
          color: baseColor,
          marginBottom: 2,
        },
        customerName: {
          fontSize: 8,
          color: '#374151',
        },
        itemsTable: {
          marginBottom: 8,
        },
        itemRow: {
          flexDirection: 'row',
          paddingVertical: 1,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        },
        itemName: {
          fontSize: 7,
          color: '#374151',
          flex: 2,
        },
        itemQty: {
          fontSize: 7,
          color: '#374151',
          flex: 1,
          textAlign: 'center',
        },
        itemTotal: {
          fontSize: 7,
          color: '#374151',
          flex: 1,
          textAlign: 'right',
        },
        total: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 4,
          alignItems: 'flex-end',
        },
        totalText: {
          fontSize: 9,
          fontWeight: 'bold',
          color: baseColor,
        },
      };
    }

    return {
      container: {
        width: width - 64,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: baseColor,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: baseColor,
        marginBottom: 12,
      },
      businessName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: baseColor,
        marginBottom: 2,
      },
      businessDetails: {
        fontSize: 11,
        color: '#64748B',
      },
      invoiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: baseColor,
        marginBottom: 2,
      },
      invoiceNumber: {
        fontSize: 12,
        color: '#64748B',
      },
      customerSection: {
        marginBottom: 12,
      },
      customerTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: baseColor,
        marginBottom: 4,
      },
      customerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
      },
      itemsTable: {
        marginBottom: 12,
      },
      itemRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 8,
      },
      itemName: {
        fontSize: 10,
        color: '#374151',
        flex: 1,
      },
      itemQty: {
        fontSize: 10,
        color: '#374151',
        flex: 1,
        textAlign: 'center',
      },
      itemTotal: {
        fontSize: 10,
        color: '#374151',
        flex: 1,
        textAlign: 'right',
      },
      total: {
        borderTopWidth: 2,
        borderTopColor: baseColor,
        paddingTop: 8,
        alignItems: 'flex-end',
      },
      totalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: baseColor,
      },
    };
  };

  const styles = getTemplateStyles();

  if (!invoiceData) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>
            {businessProfile.name || 'Your Business'}
          </Text>
          <Text style={styles.businessDetails}>
            {businessProfile.address || 'Business Address'}
          </Text>
          <Text style={styles.businessDetails}>
            {businessProfile.phone || 'Phone'} • {businessProfile.email || 'Email'}
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>
            {isThermal ? 'RECEIPT' : 'INVOICE'}
          </Text>
          <Text style={styles.invoiceNumber}>
            #{invoiceData.invoice_number}
          </Text>
          <Text style={styles.businessDetails}>
            {invoiceData.date}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <Text style={styles.customerTitle}>
          {isThermal ? 'CUSTOMER' : 'Bill To:'}
        </Text>
        <Text style={styles.customerName}>
          {invoiceData.customer_name}
        </Text>
        <Text style={styles.businessDetails}>
          {invoiceData.customer_phone || ''}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.itemsTable}>
        {invoiceData.items?.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.item_name}
            </Text>
            <Text style={styles.itemQty}>
              {item.quantity}
            </Text>
            <Text style={styles.itemTotal}>
              ₹{parseFloat(item.total).toFixed(2)}
            </Text>
          </View>
        ))}
        {invoiceData.items?.length > 3 && (
          <Text style={[styles.businessDetails, { textAlign: 'center', marginTop: 4 }]}>
            +{invoiceData.items.length - 3} more items
          </Text>
        )}
      </View>

      {/* Total */}
      <View style={styles.total}>
        <Text style={styles.totalText}>
          Total: ₹{parseFloat(invoiceData.total).toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
};

export default TemplatePreview;
