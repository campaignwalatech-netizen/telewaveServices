import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUserPermissions, selectUserRole } from '../redux/slices/authSlice';
import { NAVIGATION_MENU } from '../routes/routeConstants';

/**
 * Navigation hook with advanced routing logic
 * @param {string} userType - User type (admin, user, etc.)
 * @returns {Object} Navigation state and methods
 */
export const useNavigation = (userType = 'admin') => {
  const [activeKey, setActiveKey] = useState('dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  const userRole = useSelector(selectUserRole);
  const permissions = useSelector(selectUserPermissions);

  // Get navigation menu based on user type
  const getNavigationMenu = useCallback(() => {
    switch (userType || userRole) {
      case 'admin':
        return NAVIGATION_MENU.ADMIN;
      case 'user':
        return NAVIGATION_MENU.USER;
      default:
        return [];
    }
  }, [userType, userRole]);

  // Filter menu items based on permissions
  const getFilteredMenu = useCallback(() => {
    const menu = getNavigationMenu();
    
    return menu.filter(item => {
      // If item has permission requirements, check them
      if (item.permissions) {
        return item.permissions.every(permission => 
          permissions.includes(permission)
        );
      }
      return true;
    });
  }, [getNavigationMenu, permissions]);

  // Navigate to a menu item
  const navigateToItem = useCallback((menuKey, item = null) => {
    setActiveKey(menuKey);
    
    // Add to navigation history
    setNavigationHistory(prev => {
      const newHistory = [...prev, { key: menuKey, timestamp: Date.now() }];
      // Keep only last 10 items
      return newHistory.slice(-10);
    });

    // Update breadcrumbs
    if (item) {
      updateBreadcrumbs(item);
    }
  }, []);

  // Update breadcrumbs based on current navigation
  const updateBreadcrumbs = useCallback((item) => {
    const menu = getNavigationMenu();
    const breadcrumbPath = [];

    // Find parent item if this is a child
    const parentItem = menu.find(menuItem => 
      menuItem.children && menuItem.children.some(child => child.key === item.key)
    );

    if (parentItem) {
      breadcrumbPath.push({
        label: parentItem.label,
        key: parentItem.key
      });
    }

    breadcrumbPath.push({
      label: item.label,
      key: item.key
    });

    setBreadcrumbs(breadcrumbPath);
  }, [getNavigationMenu]);

  // Get current menu item
  const getCurrentMenuItem = useCallback(() => {
    const menu = getFilteredMenu();
    
    for (const item of menu) {
      if (item.key === activeKey) {
        return item;
      }
      
      if (item.children) {
        const childItem = item.children.find(child => child.key === activeKey);
        if (childItem) {
          return childItem;
        }
      }
    }
    
    return null;
  }, [activeKey, getFilteredMenu]);

  // Get navigation context
  const getNavigationContext = useCallback(() => {
    const currentItem = getCurrentMenuItem();
    const menu = getFilteredMenu();
    
    return {
      currentItem,
      menu,
      breadcrumbs,
      canGoBack: navigationHistory.length > 1,
      previousItem: navigationHistory[navigationHistory.length - 2]
    };
  }, [getCurrentMenuItem, getFilteredMenu, breadcrumbs, navigationHistory]);

  // Go back to previous navigation item
  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const previousItem = navigationHistory[navigationHistory.length - 2];
      setActiveKey(previousItem.key);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  }, [navigationHistory]);

  // Reset navigation to default
  const resetNavigation = useCallback(() => {
    setActiveKey('dashboard');
    setBreadcrumbs([]);
    setNavigationHistory([{ key: 'dashboard', timestamp: Date.now() }]);
  }, []);

  // Initialize navigation
  useEffect(() => {
    if (navigationHistory.length === 0) {
      setNavigationHistory([{ key: activeKey, timestamp: Date.now() }]);
    }
  }, [activeKey, navigationHistory.length]);

  return {
    // State
    activeKey,
    breadcrumbs,
    navigationHistory,
    
    // Menu data
    menu: getFilteredMenu(),
    currentMenuItem: getCurrentMenuItem(),
    navigationContext: getNavigationContext(),
    
    // Actions
    navigateToItem,
    goBack,
    resetNavigation,
    setActiveKey
  };
};

export default useNavigation;