import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const EnhancedBottomTabBar = ({ currentRoute, onTabPress }) => {
  const tabs = [
    { id: 'Dashboard', title: 'Home', icon: '🏠', route: 'Dashboard' },
    { id: 'Parties', title: 'Parties', icon: '👥', route: 'Parties' },
    { id: 'Inventory', title: 'Items', icon: '📦', route: 'Inventory' },
    { id: 'Reports', title: 'Reports', icon: '📊', route: 'Reports' },
    { id: 'Settings', title: 'Settings', icon: '⚙️', route: 'Settings' },
  ];

  const TabButton = ({ tab, isActive }) => {
    const scaleValue = new Animated.Value(isActive ? 1.1 : 1);

    React.useEffect(() => {
      Animated.spring(scaleValue, {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }, [isActive]);

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress(tab.route)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tabContent,
            isActive && styles.tabContentActive,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <View style={[
            styles.iconContainer,
            isActive && styles.iconContainerActive
          ]}>
            <Text style={[
              styles.tabIcon,
              isActive && styles.tabIconActive
            ]}>
              {tab.icon}
            </Text>
          </View>
          <Text style={[
            styles.tabTitle,
            isActive && styles.tabTitleActive
          ]}>
            {tab.title}
          </Text>
        </Animated.View>

        {/* Active indicator dot */}
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={currentRoute === tab.id}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingBottom: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    minHeight: 48,
  },
  tabContentActive: {
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    fontSize: 20,
  },
  tabTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabTitleActive: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
  },
});

export default EnhancedBottomTabBar;