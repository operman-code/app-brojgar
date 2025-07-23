// screens/Dashboard/components/TransactionItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TransactionItem = ({ transaction, onPress }) => {
  const formatAmount = (amount) => {
    if (typeof amount === 'number') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return amount;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'received':
      case 'completed':
        return '#10b981';
      case 'pending':
      case 'due':
        return '#f59e0b';
      case 'overdue':
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale':
      case 'income':
        return '#10b981';
      case 'purchase':
      case 'expense':
        return '#ef4444';
      case 'payment':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(transaction.type) }]}>
          <Text style={styles.icon}>{transaction.icon || '💼'}</Text>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.customer} numberOfLines={1}>
            {transaction.customer || 'Unknown'}
          </Text>
          <View style={styles.subDetails}>
            <Text style={styles.reference}>{transaction.reference}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: getTypeColor(transaction.type) }]}>
          {formatAmount(transaction.amount)}
        </Text>
        {transaction.status && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{transaction.status}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
  },
  details: {
    flex: 1,
  },
  customer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reference: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default TransactionItem;