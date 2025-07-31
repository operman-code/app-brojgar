// screens/Dashboard/components/KPICard.js
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

const KPICard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color = '#3B82F6', 
  onPress,
  subtitle,
  isLoading = false 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
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
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
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

  const getTrendColor = (trend) => {
    if (trend > 0) return '#10B981';
    if (trend < 0) return '#EF4444';
    return '#64748B';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗️';
    if (trend < 0) return '↘️';
    return '→';
  };

  const getGradientColors = (baseColor) => {
    switch (baseColor) {
      case '#3B82F6': // Blue
        return ['#DBEAFE', '#EBF8FF'];
      case '#EF4444': // Red
        return ['#FEE2E2', '#FEF2F2'];
      case '#10B981': // Green
        return ['#D1FAE5', '#ECFDF5'];
      case '#8B5CF6': // Purple
        return ['#EDE9FE', '#F5F3FF'];
      case '#F59E0B': // Orange
        return ['#FEF3C7', '#FFFBEB'];
      case '#EC4899': // Pink
        return ['#FCE7F3', '#FDF2F8'];
      default:
        return ['#F1F5F9', '#F8FAFC'];
    }
  };

  if (isLoading) {
    return (
      <Animated.View 
        style={[
          styles.card,
          styles.loadingCard,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingText} />
          <View style={styles.loadingValue} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
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
          colors={getGradientColors(color)}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            {trend !== undefined && (
              <View style={[styles.trendContainer, { backgroundColor: getTrendColor(trend) + '20' }]}>
                <Text style={[styles.trendIcon, { color: getTrendColor(trend) }]}>
                  {getTrendIcon(trend)}
                </Text>
                <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
                  {Math.abs(trend)}%
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.value, { color: color }]} numberOfLines={1}>
              {value}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeCircle} />
          <View style={[styles.decorativeDot, { backgroundColor: color + '40' }]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 60) / 2, // 2 columns with padding
    height: 140,
    borderRadius: 20,
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
  loadingCard: {
    backgroundColor: '#F1F5F9',
  },
  touchable: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeDot: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Loading states
  loadingContent: {
    flex: 1,
    padding: 16,
  },
  loadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  loadingText: {
    width: '60%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  loadingValue: {
    width: '80%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
});

export default KPICard;
