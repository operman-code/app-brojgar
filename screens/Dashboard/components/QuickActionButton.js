// screens/Dashboard/components/QuickActionButton.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QuickActionButton = ({ 
  title, 
  icon, 
  color = '#3B82F6', 
  onPress,
  subtitle,
  badge,
  isLoading = false 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    // Press animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  const getGradientColors = (baseColor) => {
    switch (baseColor) {
      case '#3B82F6': // Blue
        return ['#DBEAFE', '#EBF8FF', '#FFFFFF'];
      case '#EF4444': // Red
        return ['#FEE2E2', '#FEF2F2', '#FFFFFF'];
      case '#10B981': // Green
        return ['#D1FAE5', '#ECFDF5', '#FFFFFF'];
      case '#8B5CF6': // Purple
        return ['#EDE9FE', '#F5F3FF', '#FFFFFF'];
      case '#F59E0B': // Orange
        return ['#FEF3C7', '#FFFBEB', '#FFFFFF'];
      case '#EC4899': // Pink
        return ['#FCE7F3', '#FDF2F8', '#FFFFFF'];
      case '#6366F1': // Indigo
        return ['#E0E7FF', '#EEF2FF', '#FFFFFF'];
      case '#059669': // Emerald
        return ['#D1FAE5', '#ECFDF5', '#FFFFFF'];
      default:
        return ['#F1F5F9', '#F8FAFC', '#FFFFFF'];
    }
  };

  const getIconGradient = (baseColor) => {
    switch (baseColor) {
      case '#3B82F6': // Blue
        return ['#3B82F6', '#1E40AF'];
      case '#EF4444': // Red
        return ['#EF4444', '#DC2626'];
      case '#10B981': // Green
        return ['#10B981', '#059669'];
      case '#8B5CF6': // Purple
        return ['#8B5CF6', '#7C3AED'];
      case '#F59E0B': // Orange
        return ['#F59E0B', '#D97706'];
      case '#EC4899': // Pink
        return ['#EC4899', '#DB2777'];
      case '#6366F1': // Indigo
        return ['#6366F1', '#4F46E5'];
      case '#059669': // Emerald
        return ['#059669', '#047857'];
      default:
        return ['#64748B', '#475569'];
    }
  };

  if (isLoading) {
    return (
      <Animated.View 
        style={[
          styles.button,
          styles.loadingButton,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingTitle} />
          {subtitle && <View style={styles.loadingSubtitle} />}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.button,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '5deg'],
              }),
            },
          ],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getGradientColors(color)}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge */}
          {badge && (
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Icon Container */}
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={getIconGradient(color)}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.icon}>{icon}</Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: color }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={[styles.decorativeCircle, { backgroundColor: color + '20' }]} />
          <View style={[styles.decorativeLine, { backgroundColor: color + '30' }]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: (width - 60) / 3, // 3 columns with padding
    height: 100,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  loadingButton: {
    backgroundColor: '#F1F5F9',
  },
  touchable: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    padding: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  decorativeLine: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
  },
  // Loading states
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  loadingTitle: {
    width: '80%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 4,
  },
  loadingSubtitle: {
    width: '60%',
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
  },
});

export default QuickActionButton;
