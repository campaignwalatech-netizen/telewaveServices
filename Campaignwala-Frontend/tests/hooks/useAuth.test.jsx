
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import configureStore from 'redux-mock-store';
import { useAuth } from '../../src/hooks/useAuth';

// Mock react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockStore = configureStore([]);

describe('useAuth Hook', () => {
  let store;

  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        userRole: null,
        error: null,
        isLoading: false,
      },
    });
    store.dispatch = vi.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }
      return { unwrap: () => Promise.resolve({}) };
    });
  });

  it('should return the initial state from the redux store', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.userRole).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should dispatch loginUser and navigate on login for admin', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    store.dispatch.mockReturnValue({ unwrap: () => Promise.resolve({ user: { role: 'admin' } }) });

    await act(async () => {
      await result.current.login({ email: 'admin@test.com', password: 'password' });
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/admin', { replace: true });
  });

  it('should dispatch loginUser and navigate on login for user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    store.dispatch.mockReturnValue({ unwrap: () => Promise.resolve({ user: { role: 'user' } }) });

    await act(async () => {
      await result.current.login({ email: 'user@test.com', password: 'password' });
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
  });

  it('should dispatch logoutUser and navigate on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should dispatch registerUser and navigate on register', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({ name: 'Test User', email: 'test@test.com', password: 'password' });
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
  });
});
