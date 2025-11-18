
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector } from 'react-redux';
import { useNavigation } from '@/hooks/useNavigation';
import { NAVIGATION_MENU } from '@/routes/routeConstants';

// Mock Redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

// Mock routeConstants
vi.mock('@/routes/routeConstants', () => ({
  NAVIGATION_MENU: {
    ADMIN: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'users', label: 'Users', permissions: ['read:users'] },
      { 
        key: 'products', 
        label: 'Products', 
        children: [
          { key: 'all-products', label: 'All Products', permissions: ['read:products'] },
          { key: 'add-product', label: 'Add Product', permissions: ['write:products'] },
        ]
      },
    ],
    USER: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'profile', label: 'Profile' },
    ],
  },
}));

describe('useNavigation', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useSelector
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUserRole') return 'admin';
      if (selector.name === 'selectUserPermissions') return [];
      return undefined;
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    expect(result.current.activeKey).toBe('dashboard');
    expect(result.current.breadcrumbs).toEqual([]);
    expect(result.current.navigationHistory).toEqual([{ key: 'dashboard', timestamp: expect.any(Number) }]);
  });

  it('selects the correct menu based on userType', () => {
    const { result, rerender } = renderHook(({ userType }) => useNavigation(userType), {
      initialProps: { userType: 'admin' },
    });
    expect(result.current.menu.some(item => item.key === 'users')).toBe(true);

    rerender({ userType: 'user' });
    expect(result.current.menu.some(item => item.key === 'profile')).toBe(true);
    expect(result.current.menu.some(item => item.key === 'users')).toBe(false);
  });

  it('filters menu based on permissions', () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUserRole') return 'admin';
      if (selector.name === 'selectUserPermissions') return ['read:users', 'read:products'];
      return undefined;
    });

    const { result } = renderHook(() => useNavigation('admin'));

    expect(result.current.menu.find(item => item.key === 'users')).toBeDefined();
    const productsMenu = result.current.menu.find(item => item.key === 'products');
    expect(productsMenu).toBeDefined();
    expect(productsMenu.children.find(child => child.key === 'all-products')).toBeDefined();
    expect(productsMenu.children.find(child => child.key === 'add-product')).toBeUndefined();
  });

  it('navigateToItem updates state correctly', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.navigateToItem('users', { key: 'users', label: 'Users' });
    });

    expect(result.current.activeKey).toBe('users');
    expect(result.current.breadcrumbs).toEqual([{ key: 'users', label: 'Users' }]);
    expect(result.current.navigationHistory).toHaveLength(2);
    expect(result.current.navigationHistory[1].key).toBe('users');
  });
  
    it('navigateToItem handles child items and breadcrumbs', () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUserRole') return 'admin';
      if (selector.name === 'selectUserPermissions') return ['read:products'];
      return undefined;
    });
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.navigateToItem('all-products', { key: 'all-products', label: 'All Products' });
    });

    expect(result.current.activeKey).toBe('all-products');
    expect(result.current.breadcrumbs).toEqual([
      { key: 'products', label: 'Products' },
      { key: 'all-products', label: 'All Products' },
    ]);
  });


  it('goBack navigates to the previous item', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.navigateToItem('users', { key: 'users', label: 'Users' });
    });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.activeKey).toBe('dashboard');
    expect(result.current.navigationHistory).toHaveLength(1);
  });

  it('does not go back if there is no history', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.goBack();
    });

    expect(result.current.activeKey).toBe('dashboard');
    expect(result.current.navigationHistory).toHaveLength(1);
  });

  it('resetNavigation resets the state', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.navigateToItem('users', { key: 'users', label: 'Users' });
    });

    act(() => {
      result.current.resetNavigation();
    });

    expect(result.current.activeKey).toBe('dashboard');
    expect(result.current.breadcrumbs).toEqual([]);
    expect(result.current.navigationHistory).toEqual([{ key: 'dashboard', timestamp: expect.any(Number) }]);
  });

  it('getNavigationContext returns correct context', () => {
    const { result } = renderHook(() => useNavigation('admin'));

    act(() => {
      result.current.navigateToItem('users', { key: 'users', label: 'Users' });
    });

    const context = result.current.getNavigationContext();

    expect(context.currentItem.key).toBe('users');
    expect(context.canGoBack).toBe(true);
    expect(context.previousItem.key).toBe('dashboard');
  });
});
