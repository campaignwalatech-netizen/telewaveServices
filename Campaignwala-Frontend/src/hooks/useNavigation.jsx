import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import navigationService from '../services/navigationService';

/**
 * Advanced Navigation Hook
 * Provides comprehensive navigation functionality with history and breadcrumbs
 */
export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, canAccessRoute } = useAuth();
  
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);

  // Navigate with access control
  const navigateTo = useCallback((path, options = {}) => {
    if (!canAccessRoute(path)) {
      const unauthorizedRedirect = navigationService.getUnauthorizedRedirect(userRole, path);
      navigate(unauthorizedRedirect, { replace: true });
      return false;
    }

    navigate(path, options);
    return true;
  }, [navigate, canAccessRoute, userRole]);

  // Navigate with replace
  const navigateReplace = useCallback((path) => {
    return navigateTo(path, { replace: true });
  }, [navigateTo]);

  // Go back with fallback
  const goBack = useCallback((fallbackPath = null) => {
    if (navigationHistory.length > 1) {
      navigate(-1);
    } else if (fallbackPath) {
      navigateTo(fallbackPath);
    } else {
      const defaultRoute = navigationService.getDefaultRoute(userRole);
      navigateTo(defaultRoute);
    }
  }, [navigate, navigateTo, navigationHistory, userRole]);

  // Update navigation history
  useEffect(() => {
    const currentPath = location.pathname;
    
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      
      // Don't add if it's the same as the last entry
      if (newHistory[newHistory.length - 1]?.path !== currentPath) {
        newHistory.push({
          path: currentPath,
          timestamp: Date.now(),
          search: location.search,
          state: location.state
        });
        
        // Keep only last 10 entries
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      
      return newHistory;
    });

    // Update breadcrumb
    const newBreadcrumb = navigationService.getBreadcrumb(currentPath, userRole);
    setBreadcrumb(newBreadcrumb);

    // Add to navigation service history
    navigationService.addToHistory(currentPath);
  }, [location, userRole]);

  // Get navigation menu
  const getNavigationMenu = useCallback(() => {
    return navigationService.getNavigationMenu(userRole);
  }, [userRole]);

  // Check if route is active
  const isActiveRoute = useCallback((route) => {
    return navigationService.isActiveRoute(route, location.pathname);
  }, [location.pathname]);

  // Get route metadata
  const getRouteMetadata = useCallback((route = location.pathname) => {
    return navigationService.getRouteMetadata(route);
  }, [location.pathname]);

  // Build URL with query params
  const buildUrl = useCallback((basePath, params = {}) => {
    return navigationService.buildRoute(basePath, params);
  }, []);

  return {
    // Current location info
    currentPath: location.pathname,
    currentSearch: location.search,
    currentState: location.state,
    
    // Navigation functions
    navigateTo,
    navigateReplace,
    goBack,
    
    // History and breadcrumbs
    navigationHistory,
    breadcrumb,
    
    // Menu and metadata
    getNavigationMenu,
    getRouteMetadata,
    
    // Utilities
    isActiveRoute,
    buildUrl,
    
    // Current route metadata
    currentMetadata: getRouteMetadata()
  };
};

/**
 * Hook for managing route parameters
 */
export const useRouteParams = () => {
  const location = useLocation();
  
  const getParam = useCallback((key, defaultValue = null) => {
    const params = new URLSearchParams(location.search);
    return params.get(key) || defaultValue;
  }, [location.search]);
  
  const getAllParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }, [location.search]);
  
  const setParam = useCallback((key, value) => {
    const params = new URLSearchParams(location.search);
    params.set(key, value);
    return `${location.pathname}?${params.toString()}`;
  }, [location.search, location.pathname]);
  
  const removeParam = useCallback((key) => {
    const params = new URLSearchParams(location.search);
    params.delete(key);
    const queryString = params.toString();
    return queryString ? `${location.pathname}?${queryString}` : location.pathname;
  }, [location.search, location.pathname]);
  
  return {
    getParam,
    getAllParams,
    setParam,
    removeParam,
    searchParams: location.search,
    allParams: getAllParams()
  };
};

/**
 * Hook for managing page title and meta
 */
export const usePageMeta = (title, description = '') => {
  useEffect(() => {
    // Update document title
    const originalTitle = document.title;
    document.title = title ? `${title} | Campaignwala` : 'Campaignwala';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    const originalDescription = metaDescription.content;
    metaDescription.content = description;
    
    // Cleanup function
    return () => {
      document.title = originalTitle;
      metaDescription.content = originalDescription;
    };
  }, [title, description]);
};