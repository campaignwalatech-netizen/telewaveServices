import { store } from '@/redux/store';
import authReducer from '@/redux/slices/authSlice';

describe('Redux store', () => {
  it('should be a valid Redux store', () => {
    expect(store).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('should have the auth reducer configured', () => {
    const state = store.getState();
    expect(state.auth).toBeDefined();
    // You can also check if the initial state of the auth slice is correct
    const initialAuthState = authReducer(undefined, { type: '@@INIT' });
    expect(state.auth).toEqual(initialAuthState);
  });
});
