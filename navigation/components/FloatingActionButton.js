import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const FloatingActionButton = ({ onActionPress, currentRoute }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const quickActions = [
    { id: 'invoice', title: 'New Invoice', icon: '📄', route: 'Invoice' },
    { id: 'party', title: 'Add Party', icon: '👤', route: 'Parties', action: 'add' },
    { id: 'item', title: 'Add Item', icon: '📦', route: 'Inventory', action: 'add' },
    { id: 'search', title: 'Search', icon: '🔍', route: 'Search' },
  ];

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(50, 
        quickActions.map((_, index) =>
          Animated.timing(scaleAnim, {
            toValue,
            duration: 200,
            delay: index * 50,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action) => {
    setIsExpanded(false);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      onActionPress(action.route, action.action ? { action: action.action } : null);
    }, 200);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Don't show FAB on certain screens
  const hiddenRoutes = ['Invoice', 'InvoiceTemplate', 'Settings'];
  if (hiddenRoutes.includes(currentRoute)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      {isExpanded && (
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <Animated.View
              key={action.id}
              style={[
                styles.actionItem,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: scaleAnim,
                }
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </TouchableOpacity>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.fabContent,
            { transform: [{ rotate: rotation }] }
          ]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Backdrop */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleExpanded}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    alignItems: 'flex-end',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 24,
  },
});

export default FloatingActionButton;