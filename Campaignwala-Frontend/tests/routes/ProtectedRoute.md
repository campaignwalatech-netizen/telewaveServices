
# Manual Test Scenarios for ProtectedRoute.jsx

## 1. Loading State

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PR-001 | Verify loader is shown during authentication check | 1. Navigate to a protected route. <br> 2. Simulate a loading state where `isLoading` is true. | The `Loader` component should be displayed instead of the route's content or a redirect. |

## 2. Unauthenticated User

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PR-002 | Redirect unauthenticated user to login page | 1. Log out from the application. <br> 2. Attempt to navigate to a protected route (e.g., `/admin/dashboard`). | The user should be redirected to the login page (`/`). The URL should change to `/`. |
| PR-003 | Preserve original location in state | 1. Log out from the application. <br> 2. Attempt to navigate to `/admin/dashboard`. <br> 3. After being redirected to login, inspect the route state. | The location state should contain `{ from: '/admin/dashboard' }`, allowing for redirection after successful login. |

## 3. Authenticated User

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PR-004 | Allow access to user with correct role | 1. Log in as a user with the 'admin' role. <br> 2. Navigate to a route protected with `allowedRoles={['admin']}`. | The user should be able to see the content of the protected route. |
| PR-005 | Deny access to user with incorrect role | 1. Log in as a user with the 'user' role. <br> 2. Navigate to a route protected with `allowedRoles={['admin']}`. | The user should be redirected to their own dashboard (`/user`). |
| PR-006 | Redirect user with unknown role to unauthorized page | 1. Log in as a user with a role not defined in `getUserRoleRedirect` (e.g., 'guest'). <br> 2. Navigate to a route protected with `allowedRoles={['admin']}`. | The user should be redirected to the `/unauthorized` page. |
| PR-007 | Allow access to a route with no specific roles | 1. Log in as any authenticated user (e.g., 'user' or 'admin'). <br> 2. Navigate to a protected route with an empty `allowedRoles` array. | The user should be able to see the content of the protected route. |

## 4. Route Not Requiring Authentication

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PR-008 | Allow access to a public route | 1. Log out from the application. <br> 2. Navigate to a route wrapped with `ProtectedRoute` where `requireAuth={false}`. | The user should be able to see the content of the route without being redirected. |
