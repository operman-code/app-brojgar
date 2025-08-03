import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const TopNavigationBar = ({ 
  onMenuPress, 
  onNotificationPress, 
  onSearchPress,
  searchQuery,
  onSearchChange,
  showSearch = true,
  title = "Brojgar Business",
  notificationCount = 0
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const HamburgerIcon = () => (
    <View style={styles.hamburgerIcon}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </View>
  );

  const NotificationIcon = () => (
    <View style={styles.notificationContainer}>
      <View style={styles.notificationIcon}>
        <Text style={styles.notificationIconText}>🔔</Text>
      </View>
      {notificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* Top Row - Menu, Title, Notification */}
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <HamburgerIcon />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <NotificationIcon />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={[
              styles.searchInputContainer,
              searchFocused && styles.searchInputContainerFocused
            ]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions, parties, items..."
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => onSearchChange('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 24,
    height: 3,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInputContainerFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
});

export default TopNavigationBar;