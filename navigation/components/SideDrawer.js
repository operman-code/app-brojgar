import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SideDrawer = ({ isVisible, onClose, navigation, currentRoute = 'Dashboard' }) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const menuItems = [
    { id: 'Dashboard', title: 'Dashboard', icon: '🏠', route: 'Dashboard' },
    { id: 'Parties', title: 'Parties', icon: '👥', route: 'Parties' },
    { id: 'Inventory', title: 'Inventory', icon: '📦', route: 'Inventory' },
    { id: 'Purchase', title: 'Purchase', icon: '🛒', route: 'Purchase' },
    { id: 'Invoice', title: 'Invoices', icon: '📄', route: 'Invoice' },
    { id: 'Reports', title: 'Reports', icon: '📊', route: 'Reports' },
    { id: 'Search', title: 'Search', icon: '🔍', route: 'Search' },
    { id: 'Notifications', title: 'Notifications', icon: '🔔', route: 'Notifications' },
    { id: 'Settings', title: 'Settings', icon: '⚙️', route: 'Settings' },
  ];

  const handleMenuPress = (route) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(route);
    }, 250);
  };

  const ProfileSection = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>BB</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>Brojgar Business</Text>
        <Text style={styles.profileEmail}>admin@brojgar.com</Text>
      </View>
    </View>
  );

  const MenuItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        currentRoute === item.id && styles.menuItemActive
      ]}
      onPress={() => handleMenuPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <Text style={[
          styles.menuIcon,
          currentRoute === item.id && styles.menuIconActive
        ]}>
          {item.icon}
        </Text>
        <Text style={[
          styles.menuTitle,
          currentRoute === item.id && styles.menuTitleActive
        ]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.drawerContent}>
          {/* Header */}
          <View style={styles.header}>
            <ProfileSection />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>MAIN MENU</Text>
              {menuItems.slice(0, 5).map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>TOOLS</Text>
              {menuItems.slice(5, 7).map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>ACCOUNT</Text>
              {menuItems.slice(7).map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Brojgar Business v1.0.0</Text>
            <Text style={styles.footerSubText}>© 2024 operman.in</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  menuItem: {
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  menuIconActive: {
    opacity: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  menuTitleActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default SideDrawer;