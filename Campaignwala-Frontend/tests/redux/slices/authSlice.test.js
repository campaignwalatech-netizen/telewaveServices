
import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  clearError,
  resetAuthState,
  updateLastActivity,
  loginUser,
  registerUser,
  logoutUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  USER_ROLES,
} from '../../../src/redux/slices/authSlice';

// Define a base initial state for tests
const baseInitialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  role: USER_ROLES.GUEST,
  status: 'idle',
  error: null,
};

describe('authSlice reducer', () => {
  let initialState;

  beforeEach(() => {
    // Reset to a clean initial state before each test
    initialState = { ...baseInitialState };
  });

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(baseInitialState);
  });

  describe('standard reducers', () => {
    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'An error occurred' };
      const nextState = authReducer(stateWithError, clearError());
      expect(nextState.error).toBeNull();
    });

    it('should handle resetAuthState', () => {
      const loggedInState = {
        ...initialState,
        isAuthenticated: true,
        user: { id: '1', name: 'Test' },
        role: USER_ROLES.USER,
      };
      const nextState = authReducer(loggedInState, resetAuthState());
      expect(nextState).toEqual(baseInitialState);
    });

    it('should handle updateLastActivity', () => {
      const beforeState = authReducer(initialState, { type: 'unknown' });
      const nextState = authReducer(beforeState, updateLastActivity());
      expect(nextState.lastActivity).toBeCloseTo(Date.now(), -2);
    });
  });

  describe('async thunk extraReducers', () => {
    const mockUser = { id: '1', name: 'Test User', role: 'user' };
    const mockToken = 'fake-token';
    const mockError = 'Operation failed';

    // Test cases for a thunk (e.g., loginUser)
    describe('loginUser', () => {
      it('should handle loginUser.pending', () => {
        const nextState = authReducer(initialState, loginUser.pending());
        expect(nextState.status).toBe('loading');
        expect(nextState.error).toBeNull();
      });

      it('should handle loginUser.fulfilled', () => {
        const payload = { user: mockUser, token: mockToken };
        const nextState = authReducer(initialState, loginUser.fulfilled(payload));
        expect(nextState.status).toBe('succeeded');
        expect(nextState.isAuthenticated).toBe(true);
        expect(nextState.user).toEqual(mockUser);
        expect(nextState.accessToken).toBe(mockToken);
        expect(nextState.role).toBe(mockUser.role);
      });

      it('should handle loginUser.rejected', () => {
        const nextState = authReducer(initialState, loginUser.rejected(null, '', null, mockError));
        expect(nextState.status).toBe('failed');
        expect(nextState.isAuthenticated).toBe(false);
        expect(nextState.user).toBeNull();
        expect(nextState.error).toBe(mockError);
      });
    });

    // Test cases for registerUser
    describe('registerUser', () => {
        it('should handle registerUser.fulfilled', () => {
            const payload = { user: mockUser, token: mockToken };
            const nextState = authReducer(initialState, registerUser.fulfilled(payload));
            expect(nextState.isAuthenticated).toBe(true);
            expect(nextState.user).toEqual(mockUser);
            expect(nextState.role).toBe(mockUser.role);
        });
    });

    // Test cases for logoutUser
    describe('logoutUser', () => {
      it('should handle logoutUser.fulfilled', () => {
        const loggedInState = { ...initialState, isAuthenticated: true, user: mockUser };
        const nextState = authReducer(loggedInState, logoutUser.fulfilled());
        expect(nextState.isAuthenticated).toBe(false);
        expect(nextState.user).toBeNull();
        expect(nextState.role).toBe(USER_ROLES.GUEST);
        expect(nextState.status).toBe('idle');
      });
    });

    // Simplified tests for other thunks that don't change auth state on success
    const thunks = [sendOTP, verifyOTP, forgotPassword, resetPassword];
    thunks.forEach((thunk) => {
      describe(thunk.typePrefix, () => {
        it(`should handle ${thunk.typePrefix}.pending`, () => {
          const nextState = authReducer(initialState, { type: thunk.pending.type });
          expect(nextState.status).toBe('loading');
        });

        it(`should handle ${thunk.typePrefix}.fulfilled`, () => {
          const nextState = authReducer({ ...initialState, status: 'loading' }, { type: thunk.fulfilled.type });
          expect(nextState.status).toBe('succeeded');
        });

        it(`should handle ${thunk.typePrefix}.rejected`, () => {
          const nextState = authReducer(initialState, { type: thunk.rejected.type, payload: mockError });
          expect(nextState.status).toBe('failed');
          expect(nextState.error).toBe(mockError);
        });
      });
    });
  });
});
