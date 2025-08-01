// screens/Dashboard/components/KPICard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const KPICard = ({ title, value, change, icon, color }) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN');
    }
    return val || '0';
  };

  const formatChange = (changeVal) => {
    if (!changeVal || changeVal === 0) return null;
    const isPositive = changeVal > 0;
    return (
      <Text style={[styles.changeText, isPositive ? styles.positive : styles.negative]}>
        {isPositive ? '+' : ''}{changeVal}%
      </Text>
    );
  };

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>₹{formatValue(value)}</Text>
      {formatChange(change)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
});

export default KPICard;