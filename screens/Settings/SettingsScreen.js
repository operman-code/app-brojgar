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
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import SettingsService from './services/SettingsService';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [settings, setSettings] = useState({});
  const [businessProfile, setBusinessProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState({});

  // App preferences state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    loadBusinessProfile();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await SettingsService.getAllSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessProfile = async () => {
    try {
      const profile = await SettingsService.getBusinessProfile();
      setBusinessProfile(profile);
      setEditingProfile(profile);
    } catch (error) {
      console.error('Error loading business profile:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSettings(), loadBusinessProfile()]);
    setRefreshing(false);
  };

  const updateBusinessProfile = async () => {
    try {
      await SettingsService.updateBusinessProfile(editingProfile);
      setBusinessProfile(editingProfile);
      setProfileModalVisible(false);
      Alert.alert('Success', 'Business profile updated successfully');
    } catch (error) {
      console.error('Error updating business profile:', error);
      Alert.alert('Error', 'Failed to update business profile');
    }
  };

  const toggleSetting = async (key, value) => {
    try {
      await SettingsService.updateSetting(key, value, 'boolean');
      // Update local state based on key
      switch (key) {
        case 'notifications_enabled':
          setNotificationsEnabled(value);
          break;
        case 'dark_mode_enabled':
          toggleTheme();
          break;
        case 'auto_backup_enabled':
          setAutoBackupEnabled(value);
          break;
        case 'biometric_enabled':
          setBiometricEnabled(value);
          break;
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const settingsData = [
    {
      section: 'Account',
      items: [
        { 
          title: 'Business Profile', 
          subtitle: 'Update business information', 
          icon: '🏢', 
          action: () => setProfileModalVisible(true)
        },
        { 
          title: 'Tax Settings', 
          subtitle: 'GST and tax configuration', 
          icon: '📋', 
          action: () => Alert.alert('Coming Soon', 'Tax settings will be available soon')
        },
        { 
          title: 'Subscription', 
          subtitle: 'Manage your plan', 
          icon: '💳', 
          badge: 'Free', 
          action: () => Alert.alert('Subscription', 'You are on the free plan')
        },
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
          onToggle: (value) => toggleSetting('notifications_enabled', value)
        },
        { 
          title: 'Dark Mode', 
          subtitle: 'App appearance', 
          icon: '🌙', 
          toggle: true,
          value: isDarkMode,
          onToggle: (value) => toggleSetting('dark_mode_enabled', value)
        },
        { 
          title: 'Auto Backup', 
          subtitle: 'Daily data backup', 
          icon: '☁️', 
          toggle: true,
          value: autoBackupEnabled,
          onToggle: (value) => toggleSetting('auto_backup_enabled', value)
        },
        { 
          title: 'Biometric Lock', 
          subtitle: 'Fingerprint/Face ID', 
          icon: '🔐', 
          toggle: true,
          value: biometricEnabled,
          onToggle: (value) => toggleSetting('biometric_enabled', value)
        },
      ]
    },
    {
      section: 'Data & Privacy',
      items: [
        { 
          title: 'Backup & Restore', 
          subtitle: 'Manage your data', 
          icon: '💾', 
          action: () => navigation.navigate('BackupRestore')
        },
        { 
          title: 'Export Data', 
          subtitle: 'Download reports', 
          icon: '📤', 
          action: () => navigation.navigate('Reports')
        },
        { 
          title: 'Privacy Policy', 
          subtitle: 'Terms and conditions', 
          icon: '🛡️', 
          action: () => Alert.alert('Privacy Policy', 'Privacy policy will be displayed here')
        },
        { 
          title: 'Data Usage', 
          subtitle: 'Storage and sync info', 
          icon: '📊', 
          action: () => Alert.alert('Data Usage', 'Total storage used: 2.5 MB')
        },
      ]
    },
    {
      section: 'Support',
      items: [
        { 
          title: 'Help Center', 
          subtitle: 'FAQs and guides', 
          icon: '❓', 
          action: () => Alert.alert('Help Center', 'Help documentation coming soon')
        },
        { 
          title: 'Contact Support', 
          subtitle: 'Get help from our team', 
          icon: '💬', 
          action: () => Alert.alert('Contact Support', 'Email: support@brojgar.com')
        },
        { 
          title: 'Feature Requests', 
          subtitle: 'Suggest improvements', 
          icon: '💡', 
          action: () => Alert.alert('Feature Requests', 'Send requests to: feedback@brojgar.com')
        },
        { 
          title: 'Rate App', 
          subtitle: 'Share your feedback', 
          icon: '⭐', 
          action: () => Alert.alert('Rate App', 'Thank you for using our app!')
        },
      ]
    },
    {
      section: 'About',
      items: [
        { 
          title: 'App Version', 
          subtitle: 'v2.1.0 (Build 234)', 
          icon: '📱', 
          action: () => Alert.alert('Version Info', 'App Version: 2.1.0\nBuild: 234\nSDK: Expo 53')
        },
        { 
          title: 'Terms of Service', 
          subtitle: 'Legal information', 
          icon: '📄', 
          action: () => Alert.alert('Terms of Service', 'Terms of service will be displayed here')
        },
        { 
          title: 'Licenses', 
          subtitle: 'Open source libraries', 
          icon: '📋', 
          action: () => Alert.alert('Licenses', 'Open source licenses information')
        },
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully')
        }
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Manage your app preferences</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {businessProfile.businessName ? businessProfile.businessName.charAt(0) : 'B'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{businessProfile.businessName || 'Your Business'}</Text>
              <Text style={styles.profileEmail}>{businessProfile.email || 'business@example.com'}</Text>
              <Text style={styles.profileBusiness}>{businessProfile.ownerName || 'Business Owner'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setProfileModalVisible(true)}
            >
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

      {/* Business Profile Edit Modal */}
      <Modal visible={profileModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Business Profile</Text>
            <TouchableOpacity onPress={updateBusinessProfile}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Business Name</Text>
              <TextInput
                style={styles.formInput}
                value={editingProfile.businessName}
                onChangeText={(text) => setEditingProfile({...editingProfile, businessName: text})}
                placeholder="Enter business name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Owner Name</Text>
              <TextInput
                style={styles.formInput}
                value={editingProfile.ownerName}
                onChangeText={(text) => setEditingProfile({...editingProfile, ownerName: text})}
                placeholder="Enter owner name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={editingProfile.email}
                onChangeText={(text) => setEditingProfile({...editingProfile, email: text})}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.formInput}
                value={editingProfile.phone}
                onChangeText={(text) => setEditingProfile({...editingProfile, phone: text})}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>GST Number</Text>
              <TextInput
                style={styles.formInput}
                value={editingProfile.gstNumber}
                onChangeText={(text) => setEditingProfile({...editingProfile, gstNumber: text})}
                placeholder="Enter GST number"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={editingProfile.address}
                onChangeText={(text) => setEditingProfile({...editingProfile, address: text})}
                placeholder="Enter business address"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default SettingsScreen;
