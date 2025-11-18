import { 
  PUBLIC_ROUTES, 
  ADMIN_ROUTES, 
  USER_ROUTES, 
  DEFAULT_REDIRECTS,
  NAVIGATION_MENU 
} from '../routes/routeConstants';

/**
 * Navigation Service
 * Centralized navigation logic with role-based routing
 */
class NavigationService {
  constructor() {
    this.currentUser = null;
    this.navigationHistory = [];
  }

  /**
   * Set current user context
   */
  setUser(user) {
    this.currentUser = user;
  }

  /**
   * Get navigation menu based on user role
   */
  getNavigationMenu(role) {
    switch (role) {
      case 'admin':
        return NAVIGATION_MENU.ADMIN;
      case 'user':
        return NAVIGATION_MENU.USER;
      default:
        return [];
    }
  }

  /**
   * Get default route for user role
   */
  getDefaultRoute(role) {
    return DEFAULT_REDIRECTS[role] || DEFAULT_REDIRECTS.guest;
  }

  /**
   * Check if user can access route
   */
  canAccessRoute(route, userRole, userPermissions = []) {
    // Public routes are always accessible
    if (this.isPublicRoute(route)) {
      return true;
    }

    // Admin routes
    if (this.isAdminRoute(route)) {
      return userRole === 'admin';
    }

    // User routes
    if (this.isUserRoute(route)) {
      return userRole === 'user';
    }

    // Check specific permissions for protected routes
    return this.hasRequiredPermissions(route, userPermissions);
  }

  /**
   * Check if route is public
   */
  isPublicRoute(route) {
    return Object.values(PUBLIC_ROUTES).includes(route);
  }

  /**
   * Check if route is admin-only
   */
  isAdminRoute(route) {
    return route.startsWith('/admin');
  }

  /**
   * Check if route is user-only
   */
  isUserRoute(route) {
    return route.startsWith('/user');
  }

  /**
   * Check if user has required permissions
   */
  hasRequiredPermissions(route, userPermissions) {
    // Define route permissions mapping
    const routePermissions = {
      [ADMIN_ROUTES.USERS]: ['manage_users'],
      [ADMIN_ROUTES.LOGS]: ['view_logs'],
      [ADMIN_ROUTES.SETTINGS]: ['manage_settings']
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true;

    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Get redirect route for unauthorized access
   */
  getUnauthorizedRedirect(userRole, attemptedRoute) {
    // Store attempted route for post-login redirect
    this.setIntendedRoute(attemptedRoute);

    // Redirect based on user role
    if (userRole === 'admin') {
      return ADMIN_ROUTES.DASHBOARD;
    } else if (userRole === 'user') {
      return USER_ROUTES.DASHBOARD;
    } else {
      return PUBLIC_ROUTES.LOGIN;
    }
  }

  /**
   * Set intended route for post-login redirect
   */
  setIntendedRoute(route) {
    sessionStorage.setItem('intendedRoute', route);
  }

  /**
   * Get and clear intended route
   */
  getIntendedRoute() {
    const route = sessionStorage.getItem('intendedRoute');
    sessionStorage.removeItem('intendedRoute');
    return route;
  }

  /**
   * Add to navigation history
   */
  addToHistory(route) {
    this.navigationHistory.push({
      route,
      timestamp: Date.now()
    });

    // Keep only last 10 routes
    if (this.navigationHistory.length > 10) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Get navigation history
   */
  getHistory() {
    return this.navigationHistory;
  }

  /**
   * Clear navigation history
   */
  clearHistory() {
    this.navigationHistory = [];
  }

  /**
   * Get breadcrumb for current route
   */
  getBreadcrumb(route, role) {
    const menu = this.getNavigationMenu(role);
    const breadcrumb = [];

    // Find route in menu structure
    const findInMenu = (items, currentPath = []) => {
      for (const item of items) {
        const newPath = [...currentPath, item];
        
        if (item.path === route) {
          return newPath;
        }
        
        if (item.children) {
          const found = findInMenu(item.children, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    const path = findInMenu(menu);
    if (path) {
      return path.map(item => ({
        label: item.label,
        path: item.path,
        key: item.key
      }));
    }

    return breadcrumb;
  }

  /**
   * Check if current route is active
   */
  isActiveRoute(route, currentRoute) {
    if (route === currentRoute) return true;
    
    // Check for nested routes
    if (currentRoute.startsWith(route + '/')) return true;
    
    return false;
  }

  /**
   * Get route parameters
   */
  getRouteParams(route) {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * Build route with parameters
   */
  buildRoute(basePath, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  /**
   * Validate route format
   */
  isValidRoute(route) {
    try {
      new URL(route, window.location.origin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get route metadata
   */
  getRouteMetadata(route) {
    // Define route metadata
    const metadata = {
      [PUBLIC_ROUTES.LOGIN]: {
        title: 'Login',
        description: 'Sign in to your account',
        requiresAuth: false
      },
      [ADMIN_ROUTES.DASHBOARD]: {
        title: 'Admin Dashboard',
        description: 'Administrative overview and controls',
        requiresAuth: true,
        roles: ['admin']
      },
      [USER_ROUTES.DASHBOARD]: {
        title: 'User Dashboard',
        description: 'Personal dashboard and activities',
        requiresAuth: true,
        roles: ['user']
      }
    };

    return metadata[route] || {
      title: 'Page',
      description: '',
      requiresAuth: true
    };
  }
}

// Create singleton instance
const navigationService = new NavigationService();

export default navigationService;