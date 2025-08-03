import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TopNavigationBar from './TopNavigationBar';
import SideDrawer from './SideDrawer';
import FloatingActionButton from './FloatingActionButton';
import { useNavigation as useCustomNavigation } from '../../context/NavigationContext';

const MainLayout = ({ children, showTopNav = true, showSearch = true, title }) => {
  const {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    currentRoute,
    searchQuery,
    handleSearch,
    clearSearch,
    notificationCount,
    handleNotificationPress,
    navigateTo,
  } = useCustomNavigation();

  // Create navigation object for screens
  const navigation = {
    navigate: navigateTo,
    goBack: () => {
      // Handle back navigation
      if (currentRoute !== 'Dashboard') {
        navigateTo('Dashboard');
      }
    },
    push: navigateTo,
    replace: navigateTo,
  };

  const handleSearchChange = (query) => {
    if (query.length === 0) {
      clearSearch();
    } else {
      handleSearch(query);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Navigation Bar */}
      {showTopNav && (
        <TopNavigationBar
          onMenuPress={openDrawer}
          onNotificationPress={handleNotificationPress}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showSearch={showSearch}
          title={title}
          notificationCount={notificationCount}
        />
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Side Drawer */}
      <SideDrawer
        isVisible={isDrawerOpen}
        onClose={closeDrawer}
        navigation={navigation}
        currentRoute={currentRoute}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onActionPress={navigateTo}
        currentRoute={currentRoute}
      />
    </KeyboardAvoidingView>
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
});

export default MainLayout;