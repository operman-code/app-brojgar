import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [routeParams, setRouteParams] = useState(null);

  // Load notification count on mount
  useEffect(() => {
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    try {
      // This would typically come from your notification service
      // For now, we'll use a placeholder
      setNotificationCount(3);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const navigateTo = (route, params = null) => {
    setCurrentRoute(route);
    setRouteParams(params);
    closeDrawer();
  };

  const goBack = () => {
    // This would typically handle navigation stack
    // For now, we'll just go to Dashboard
    setCurrentRoute('Dashboard');
    setRouteParams(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      // Navigate to search screen with query
      navigateTo('Search', { query });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleNotificationPress = () => {
    navigateTo('Notifications');
  };

  const updateNotificationCount = (count) => {
    setNotificationCount(count);
  };

  const contextValue = {
    // Drawer state
    isDrawerOpen,
    openDrawer,
    closeDrawer,

    // Navigation state
    currentRoute,
    routeParams,
    navigateTo,
    goBack,

    // Search functionality
    searchQuery,
    handleSearch,
    clearSearch,

    // Notifications
    notificationCount,
    handleNotificationPress,
    updateNotificationCount,
    loadNotificationCount,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;