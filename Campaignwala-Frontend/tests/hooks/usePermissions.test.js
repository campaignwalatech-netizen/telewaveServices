
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import { usePermissions } from '@/hooks/usePermissions';
import { setPermissions } from '@/redux/slices/authSlice';

// Mock Redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe('usePermissions', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  const setupHook = (role, perms) => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUserRole') return role;
      if (selector.name === 'selectUserPermissions') return perms;
      return undefined;
    });
    return renderHook(() => usePermissions());
  };

  describe('hasPermission', () => {
    it('returns true if user has the permission', () => {
      const { result } = setupHook('user', ['dashboard.read']);
      expect(result.current.hasPermission('dashboard.read')).toBe(true);
    });

    it('returns false if user does not have the permission', () => {
      const { result } = setupHook('user', []);
      expect(result.current.hasPermission('dashboard.read')).toBe(false);
    });

    it('returns true for admin role regardless of permissions', () => {
      const { result } = setupHook('admin', []);
      expect(result.current.hasPermission('any.permission')).toBe(true);
    });

    it('returns true if no permission is required', () => {
      const { result } = setupHook('user', []);
      expect(result.current.hasPermission(null)).toBe(true);
    });
  });

  describe('hasAllPermissions and hasAnyPermission', () => {
    it('hasAllPermissions returns true when all permissions are present', () => {
      const { result } = setupHook('user', ['a', 'b', 'c']);
      expect(result.current.hasAllPermissions(['a', 'b'])).toBe(true);
    });

    it('hasAllPermissions returns false when any permission is missing', () => {
      const { result } = setupHook('user', ['a', 'b']);
      expect(result.current.hasAllPermissions(['a', 'c'])).toBe(false);
    });

    it('hasAnyPermission returns true when at least one permission is present', () => {
      const { result } = setupHook('user', ['c']);
      expect(result.current.hasAnyPermission(['a', 'b', 'c'])).toBe(true);
    });

    it('hasAnyPermission returns false when no permissions are present', () => {
      const { result } = setupHook('user', ['d']);
      expect(result.current.hasAnyPermission(['a', 'b', 'c'])).toBe(false);
    });
  });

  describe('Role Flags', () => {
    it('sets isAdmin correctly', () => {
      const { result } = setupHook('admin', []);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isUser).toBe(false);
    });

    it('sets isUser correctly', () => {
      const { result } = setupHook('user', []);
      expect(result.current.isUser).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('sets isGuest correctly for null role', () => {
        const { result } = setupHook(null, []);
        expect(result.current.isGuest).toBe(true);
    });
  });

  describe('getFeaturePermissions', () => {
    it('returns correct flags for a feature', () => {
      const { result } = setupHook('user', ['dashboard.read', 'profile.write']);
      const featurePerms = result.current.getFeaturePermissions('dashboard');
      expect(featurePerms.canRead).toBe(true);
      expect(featurePerms.canWrite).toBe(false);
      expect(featurePerms.all).toEqual(['dashboard.read']);
    });
  });

  describe('Actions', () => {
    it('updatePermissions dispatches setPermissions action', () => {
      const { result } = setupHook('user', []);
      const newPerms = ['a', 'b'];
      act(() => {
        result.current.updatePermissions(newPerms);
      });
      expect(mockDispatch).toHaveBeenCalledWith(setPermissions(newPerms));
    });

    it('updatePermissions clears the permission cache', () => {
        const { result } = setupHook('user', ['a']);
        // Call once to cache
        expect(result.current.hasPermission('a')).toBe(true);

        // Update permissions
        act(() => {
            result.current.updatePermissions([]);
        });

        // Check if the cached permission is now false
        expect(result.current.hasPermission('a')).toBe(false);
      });
  });
});
