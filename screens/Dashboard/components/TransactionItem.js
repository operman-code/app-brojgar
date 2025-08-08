// screens/Dashboard/components/TransactionItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TransactionItem = ({ transaction, onPress }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return '💰';
      case 'expense':
        return '💳';
      case 'sale':
        return '🛒';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'income':
      case 'sale':
        return '#10b981';
      case 'expense':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'number') {
      return amount.toLocaleString('en-IN');
    }
    return amount || '0';
  };

  // Label logic
  let partyLabel = 'Transaction';
  if (transaction.type === 'expense') {
    partyLabel = `Supplier: ${transaction.customer || transaction.description || 'N/A'}`;
  } else if (transaction.type === 'income' || transaction.type === 'sale') {
    partyLabel = `Customer: ${transaction.customer || transaction.description || 'N/A'}`;
  } else {
    partyLabel = transaction.customer || transaction.description || 'Transaction';
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(transaction.type) + '20' }]}>
          <Text style={styles.icon}>{getTypeIcon(transaction.type)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.customer}>{partyLabel}</Text>
          <Text style={styles.reference}>{transaction.reference || `#${transaction.id}`}</Text>
          <Text style={styles.date}>{formatDate(transaction.date || transaction.created_at)}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: getTypeColor(transaction.type) }]}>₹{formatAmount(transaction.amount)}</Text>
        <Text style={styles.type}>{transaction.type}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
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
  reference: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
});

export default TransactionItem;
