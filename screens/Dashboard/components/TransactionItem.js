// screens/Dashboard/components/TransactionItem.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionItem = ({ 
  transaction, 
  onPress,
  isLoading = false 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
        return '#10B981';
      case 'expense':
        return '#EF4444';
      case 'sale':
        return '#3B82F6';
      case 'purchase':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
        return '💰';
      case 'expense':
        return '💸';
      case 'sale':
        return '🛒';
      case 'purchase':
        return '📦';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  if (isLoading) {
    return (
      <Animated.View 
        style={[
          styles.container,
          styles.loadingContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingTextContainer}>
            <View style={styles.loadingTitle} />
            <View style={styles.loadingSubtitle} />
          </View>
          <View style={styles.loadingAmount} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Icon and Type */}
          <View style={styles.leftSection}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: getTypeColor(transaction.type) + '20' }
            ]}>
              <Text style={styles.icon}>
                {getTypeIcon(transaction.type)}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.customerName} numberOfLines={1}>
                {transaction.customer_name || 'Unknown Customer'}
              </Text>
              <Text style={styles.reference} numberOfLines={1}>
                {transaction.reference || 'No Reference'}
              </Text>
              <View style={styles.metaContainer}>
                <Text style={styles.type}>
                  {transaction.type?.toUpperCase() || 'TRANSACTION'}
                </Text>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(transaction.status) }
                ]} />
                <Text style={[
                  styles.status, 
                  { color: getStatusColor(transaction.status) }
                ]}>
                  {transaction.status || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount and Date */}
          <View style={styles.rightSection}>
            <Text style={[
              styles.amount,
              { color: getTypeColor(transaction.type) }
            ]}>
              ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.date}>
              {new Date(transaction.date).toLocaleDateString('en-IN')}
            </Text>
            <View style={[
              styles.amountIndicator,
              { backgroundColor: getTypeColor(transaction.type) + '20' }
            ]} />
          </View>

          {/* Decorative Elements */}
          <View style={[
            styles.decorativeLine,
            { backgroundColor: getTypeColor(transaction.type) + '30' }
          ]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#F1F5F9',
  },
  touchable: {
    flex: 1,
  },
  gradientBackground: {
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  reference: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  status: {
    fontSize: 10,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  amountIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  decorativeLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  // Loading states
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  loadingTextContainer: {
    flex: 1,
  },
  loadingTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  loadingSubtitle: {
    width: '60%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  loadingAmount: {
    width: 80,
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
});

export default TransactionItem;
