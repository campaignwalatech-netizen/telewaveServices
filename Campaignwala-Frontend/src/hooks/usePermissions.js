import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectUserPermissions, 
  selectUserRole,
  setPermissions 
} from '../redux/slices/authSlice';

/**
 * Permission management hook
 * @returns {Object} Permission state and methods
 */
export const usePermissions = () => {
  const dispatch = useDispatch();
  const permissions = useSelector(selectUserPermissions);
  const userRole = useSelector(selectUserRole);
  
  const [permissionCache, setPermissionCache] = useState(new Map());

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!permission) return true;
    
    // Check cache first
    if (permissionCache.has(permission)) {
      return permissionCache.get(permission);
    }
    
    const hasAccess = permissions.includes(permission) || userRole === 'admin';
    
    // Cache the result
    setPermissionCache(prev => new Map(prev).set(permission, hasAccess));
    
    return hasAccess;
  }, [permissions, userRole, permissionCache]);

  // Check if user has all required permissions
  const hasAllPermissions = useCallback((requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return true;
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Check if user has any of the required permissions
  const hasAnyPermission = useCallback((requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return true;
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Get permissions for a specific feature
  const getFeaturePermissions = useCallback((feature) => {
    const featurePermissions = permissions.filter(permission => 
      permission.startsWith(`${feature}.`)
    );
    
    return {
      canRead: hasPermission(`${feature}.read`),
      canWrite: hasPermission(`${feature}.write`),
      canDelete: hasPermission(`${feature}.delete`),
      canAdmin: hasPermission(`${feature}.admin`),
      all: featurePermissions
    };
  }, [permissions, hasPermission]);

  // Update user permissions
  const updatePermissions = useCallback((newPermissions) => {
    dispatch(setPermissions(newPermissions));
    setPermissionCache(new Map()); // Clear cache
  }, [dispatch]);

  // Clear permission cache
  const clearPermissionCache = useCallback(() => {
    setPermissionCache(new Map());
  }, []);

  // Get role-based permissions
  const getRolePermissions = useCallback(() => {
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      user: [
        'dashboard.read',
        'profile.read',
        'profile.write',
        'leads.read',
        'leads.write',
        'attendance.read',
        'analytics.read'
      ],
      moderator: [
        'dashboard.read',
        'users.read',
        'leads.read',
        'leads.write',
        'leads.moderate',
        'analytics.read'
      ],
      guest: ['public.read']
    };

    return rolePermissions[userRole] || rolePermissions.guest;
  }, [userRole]);

  // Clear cache when permissions change
  useEffect(() => {
    setPermissionCache(new Map());
  }, [permissions]);

  return {
    // State
    permissions,
    userRole,
    
    // Permission checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getFeaturePermissions,
    
    // Role checks
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isModerator: userRole === 'moderator',
    isGuest: !userRole || userRole === 'guest',
    
    // Actions
    updatePermissions,
    clearPermissionCache,
    
    // Utilities
    getRolePermissions
  };
};

export default usePermissions;