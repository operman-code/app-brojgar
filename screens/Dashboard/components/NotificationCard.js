// screens/Dashboard/components/NotificationCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationCard = ({ 
  title, 
  subtitle, 
  icon, 
  color = '#3B82F6', 
  onPress,
  timestamp,
  isRead = false,
  isLoading = false 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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

  const getGradientColors = (baseColor) => {
    switch (baseColor) {
      case '#3B82F6': // Blue
        return ['#DBEAFE', '#EBF8FF'];
      case '#EF4444': // Red
        return ['#FEE2E2', '#FEF2F2'];
      case '#10B981': // Green
        return ['#D1FAE5', '#ECFDF5'];
      case '#F59E0B': // Orange
        return ['#FEF3C7', '#FFFBEB'];
      case '#8B5CF6': // Purple
        return ['#EDE9FE', '#F5F3FF'];
      default:
        return ['#F1F5F9', '#F8FAFC'];
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
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingTextContainer}>
            <View style={styles.loadingTitle} />
            <View style={styles.loadingSubtitle} />
          </View>
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
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ]
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
          {/* Unread Indicator */}
          {!isRead && (
            <View style={[styles.unreadIndicator, { backgroundColor: color }]} />
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
            {timestamp && (
              <Text style={styles.timestamp}>
                {timestamp}
              </Text>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <View style={[styles.actionButton, { backgroundColor: color + '20' }]}>
              <Text style={[styles.actionText, { color: color }]}>
                View
              </Text>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={[styles.decorativeCircle, { backgroundColor: color + '15' }]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 120,
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
    marginRight: 12,
  },
  loadingContainer: {
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
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  actionContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  // Loading states
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  loadingTextContainer: {
    flex: 1,
  },
  loadingTitle: {
    width: '80%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    marginBottom: 8,
  },
  loadingSubtitle: {
    width: '60%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
});

export default NotificationCard;
