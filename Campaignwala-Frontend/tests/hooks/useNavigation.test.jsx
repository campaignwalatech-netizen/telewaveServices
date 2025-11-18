
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigation, useRouteParams, usePageMeta } from '../../src/hooks/useNavigation';

// Mock dependencies
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: vi.fn(),
  };
});

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/services/navigationService', () => ({
  default: {
    getUnauthorizedRedirect: vi.fn(),
    getDefaultRoute: vi.fn(),
    getBreadcrumb: vi.fn(() => []),
    addToHistory: vi.fn(),
    getNavigationMenu: vi.fn(() => []),
    isActiveRoute: vi.fn(),
    getRouteMetadata: vi.fn(() => ({})),
    buildRoute: vi.fn(),
  },
}));

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';

describe('useNavigation Hook', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '/', search: '', state: null });
    useAuth.mockReturnValue({ userRole: 'user', canAccessRoute: () => true });
  });

  it('should navigate to a given path', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('/dashboard');
    });
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard', {});
  });

  it('should go back if history exists', () => {
    const { result, rerender } = renderHook(() => useNavigation());
    act(() => {
        useLocation.mockReturnValue({ pathname: '/first', search: '', state: null });
    });
    rerender();
    act(() => {
        useLocation.mockReturnValue({ pathname: '/second', search: '', state: null });
    });
    rerender();

    act(() => {
      result.current.goBack();
    });
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});

describe('useRouteParams Hook', () => {
    it('should get a parameter from the URL', () => {
        useLocation.mockReturnValue({ search: '?foo=bar' });
        const { result } = renderHook(() => useRouteParams());
        expect(result.current.getParam('foo')).toBe('bar');
      });

  it('should set a parameter', () => {
    useLocation.mockReturnValue({ pathname: '/test', search: '' });
    const { result } = renderHook(() => useRouteParams());
    const newUrl = result.current.setParam('foo', 'bar');
    expect(newUrl).toBe('/test?foo=bar');
  });

  it('should remove a parameter', () => {
    useLocation.mockReturnValue({ pathname: '/test', search: '?foo=bar&baz=qux' });
    const { result } = renderHook(() => useRouteParams());
    const newUrl = result.current.removeParam('foo');
    expect(newUrl).toBe('/test?baz=qux');
  });
});

describe('usePageMeta Hook', () => {
  it('should set the document title and meta description', () => {
    const { unmount } = renderHook(() => usePageMeta('Test Title', 'Test Description'));
    expect(document.title).toBe('Test Title | Campaignwala');
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc.content).toBe('Test Description');

    unmount();
    // It should clean up after itself, but this is hard to test in jsdom without more setup
  });
});
