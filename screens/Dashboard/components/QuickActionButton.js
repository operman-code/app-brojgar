// screens/Dashboard/components/QuickActionButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const QuickActionButton = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color + '10', borderColor: color + '30' }]} 
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuickActionButton;