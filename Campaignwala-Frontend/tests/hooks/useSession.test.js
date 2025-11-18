
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from '@/hooks/useSession';
import { forceLogout, updateLastActivity } from '@/redux/slices/authSlice';

// Mock Redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe('useSession', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupHook = (isAuthenticated, timeRemaining, options = {}) => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectIsAuthenticated') return isAuthenticated;
      if (selector.name === 'selectSessionTimeRemaining') return timeRemaining;
      return undefined;
    });
    return renderHook(() => useSession(options));
  };

  it('initializes and sets up interval when authenticated', () => {
    setupHook(true, 10 * 60 * 1000);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30 * 1000);
  });

  it('does not set up interval when not authenticated', () => {
    setupHook(false, 0);
    expect(setInterval).not.toHaveBeenCalled();
  });

  it('shows warning when session time is below warningTime', () => {
    const warningTime = 5 * 60 * 1000;
    const { result } = setupHook(true, warningTime - 1000, { warningTime });

    act(() => {
      vi.advanceTimersByTime(30 * 1000); // Advance past one checkInterval
    });

    expect(result.current.showWarning).toBe(true);
  });

  it('does not show warning if already shown', () => {
    const warningTime = 5 * 60 * 1000;
    const { result } = setupHook(true, warningTime - 1000, { warningTime });

    // First check
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(result.current.showWarning).toBe(true);

    // Dismiss warning
    act(() => {
      result.current.dismissWarning();
    });
    expect(result.current.showWarning).toBe(false);

    // Second check, should not show warning again
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(result.current.showWarning).toBe(false);
  });

  it('forces logout when session time is zero or less', () => {
    setupHook(true, 0);

    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });

    expect(mockDispatch).toHaveBeenCalledWith(forceLogout());
  });

  it('extendSession dispatches updateLastActivity and hides warning', () => {
    const { result } = setupHook(true, 30000);

    // Show warning first
    act(() => {
        vi.advanceTimersByTime(30 * 1000);
    });
    expect(result.current.showWarning).toBe(true);

    // Extend session
    act(() => {
      result.current.extendSession();
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateLastActivity());
    expect(result.current.showWarning).toBe(false);
  });

  it('logout dispatches forceLogout', () => {
    const { result } = setupHook(true, 100000);

    act(() => {
      result.current.logout();
    });

    expect(mockDispatch).toHaveBeenCalledWith(forceLogout());
  });

  it('getFormattedTimeRemaining returns correct format', () => {
    const { result } = setupHook(true, 155 * 1000); // 2 minutes 35 seconds
    const time = result.current.timeRemaining;

    expect(time.minutes).toBe(2);
    expect(time.seconds).toBe(35);
    expect(time.formatted).toBe('02:35');
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = setupHook(true, 100000);
    unmount();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('cleans up interval when authentication status changes to false', () => {
    const { rerender } = setupHook(true, 100000);
    
    useSelector.mockImplementation((selector) => {
        if (selector.name === 'selectIsAuthenticated') return false;
        if (selector.name === 'selectSessionTimeRemaining') return 0;
        return undefined;
    });

    rerender();

    expect(clearInterval).toHaveBeenCalled();
  });
});
