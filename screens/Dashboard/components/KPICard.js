// screens/Dashboard/components/KPICard.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

const KPICard = ({ title, value, change, icon, color = '#3b82f6' }) => {
  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      } else if (value >= 1000) {
        return `₹${(value / 1000).toFixed(1)}K`;
      } else {
        return `₹${value.toLocaleString()}`;
      }
    }
    return value;
  };

  const isPositive = change && change.startsWith('+');
  const changeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        {change && (
          <View style={[styles.changeContainer, { backgroundColor: changeColor }]}>
            <Text style={styles.changeText}>{change}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{formatValue(value)}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: '#ffffff',
  },
  changeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default KPICard;