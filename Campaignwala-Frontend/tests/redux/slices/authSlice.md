
# Manual Test Scenarios for authSlice.js

*These tests are for the Redux slice logic and would typically be verified by using the application and observing state changes in the Redux DevTools.*

## 1. Initial State

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AUTH-001 | Initial state from empty localStorage | 1. Clear `localStorage`. <br> 2. Load the application. | The `auth` state in Redux should match the `initialState` defined in the slice (e.g., `isAuthenticated: false`, `user: null`, `role: 'guest'`). |
| AUTH-002 | Initial state from populated localStorage | 1. Manually set `isLoggedIn`, `user`, `accessToken`, etc., in `localStorage`. <br> 2. Reload the application. | The `auth` state should be hydrated from the `localStorage` values, showing the user as logged in. |

## 2. Async Thunks (Login, Register, Logout)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AUTH-003 | Pending state for login | 1. Dispatch the `loginUser` action by submitting the login form. | The `auth.status` should change to 'loading'. Any previous `auth.error` should be cleared. |
| AUTH-004 | Fulfilled state for login | 1. Successfully complete a login. | `status` should be 'succeeded'. `isAuthenticated` should be `true`. `user`, `accessToken`, and `role` should be populated with data from the API response. `localStorage` should be updated. |
| AUTH-005 | Rejected state for login | 1. Attempt to log in with incorrect credentials. | `status` should be 'failed'. `isAuthenticated` should be `false`. `auth.error` should contain the error message from the server. |
| AUTH-006 | Fulfilled state for logout | 1. Click the logout button. | `isAuthenticated` should become `false`. `user`, `accessToken`, and `role` should be reset to their logged-out values. `localStorage` should be cleared. |
| AUTH-007 | Register user flow | 1. Complete the registration form. | The `registerUser` thunk should follow the same pending/fulfilled/rejected state changes as the `loginUser` thunk. |

## 3. Standard Reducers

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AUTH-008 | `clearError` reducer | 1. Trigger an error (e.g., failed login). <br> 2. Dispatch the `clearError` action. | The `auth.error` state should be set to `null`. |
| AUTH-009 | `updateLastActivity` reducer | 1. Dispatch the `updateLastActivity` action. | The `auth.lastActivity` state should be updated with the current timestamp. |
| AUTH-010 | `resetAuthState` reducer | 1. Log in. <br> 2. Dispatch the `resetAuthState` action. | The entire `auth` slice should be reset to its default initial state, effectively logging the user out without calling the logout API. |
