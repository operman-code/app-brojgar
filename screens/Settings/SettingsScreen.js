import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Switch,
  Alert,
} from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const settingsData = [
    {
      section: 'Account',
      items: [
        { title: 'Business Profile', subtitle: 'Update business information', icon: '🏢', action: () => {} },
        { title: 'User Settings', subtitle: 'Manage user preferences', icon: '👤', action: () => {} },
        { title: 'Subscription', subtitle: 'Manage your plan', icon: '💳', badge: 'Pro', action: () => {} },
      ]
    },
    {
      section: 'App Preferences',
      items: [
        { 
          title: 'Notifications', 
          subtitle: 'Push notifications', 
          icon: '🔔', 
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        { 
          title: 'Dark Mode', 
          subtitle: 'App appearance', 
          icon: '🌙', 
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled
        },
        { 
          title: 'Auto Backup', 
          subtitle: 'Daily data backup', 
          icon: '☁️', 
          toggle: true,
          value: autoBackupEnabled,
          onToggle: setAutoBackupEnabled
        },
        { 
          title: 'Biometric Lock', 
          subtitle: 'Fingerprint/Face ID', 
          icon: '🔐', 
          toggle: true,
          value: biometricEnabled,
          onToggle: setBiometricEnabled
        },
      ]
    },
    {
      section: 'Data & Privacy',
      items: [
        { title: 'Backup & Restore', subtitle: 'Manage your data', icon: '💾', action: () => navigation.navigate('Search') },
        { title: 'Export Data', subtitle: 'Download reports', icon: '📤', action: () => {} },
        { title: 'Privacy Policy', subtitle: 'Terms and conditions', icon: '🛡️', action: () => {} },
        { title: 'Data Usage', subtitle: 'Storage and sync', icon: '📊', action: () => {} },
      ]
    },
    {
      section: 'Support',
      items: [
        { title: 'Help Center', subtitle: 'FAQs and guides', icon: '❓', action: () => {} },
        { title: 'Contact Support', subtitle: 'Get help from our team', icon: '💬', action: () => {} },
        { title: 'Feature Requests', subtitle: 'Suggest improvements', icon: '💡', action: () => {} },
        { title: 'Rate App', subtitle: 'Share your feedback', icon: '⭐', action: () => {} },
      ]
    },
    {
      section: 'About',
      items: [
        { title: 'App Version', subtitle: 'v2.1.0 (Build 234)', icon: '📱', action: () => {} },
        { title: 'Terms of Service', subtitle: 'Legal information', icon: '📄', action: () => {} },
        { title: 'Licenses', subtitle: 'Open source libraries', icon: '📋', action: () => {} },
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const renderSettingsItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.settingsItem}
      onPress={item.action}
      disabled={item.toggle}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemIconText}>{item.icon}</Text>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.toggle ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={item.value ? '#ffffff' : '#ffffff'}
            style={styles.switch}
          />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section, sectionIndex) => (
    <View key={sectionIndex} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.section}</Text>
      <View style={styles.sectionCard}>
        {section.items.map((item, index) => renderSettingsItem(item, index))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>JD</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@example.com</Text>
              <Text style={styles.profileBusiness}>Doe Electronics Store</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Sections */}
          {settingsData.map(renderSection)}

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  profileBusiness: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  editProfileButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editProfileText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 18,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  itemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  chevron: {
    fontSize: 24,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SettingsScreen;