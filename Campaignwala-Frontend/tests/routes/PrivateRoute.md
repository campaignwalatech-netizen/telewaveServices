# Manual Test Cases for PrivateRoute

**Component:** `PrivateRoute.jsx`

**Objective:** To verify that the `PrivateRoute` component correctly protects routes based on authentication status and specific user permissions.

---

### Test Case 1: Access Denied - Unauthenticated

| Test Case ID | TC_PRIVATE_01                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an unauthenticated user is redirected to the login page. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute`.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to the login page (`/`). The attempted location should be passed in the state for a potential redirect after login. |

---

### Test Case 2: Access Granted - No Specific Permissions Required

| Test Case ID | TC_PRIVATE_02                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that any authenticated user can access a private route that doesn't require specific permissions. |
| **Prerequisites** | The user is logged in (any role). |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute` without a `requiredPermissions` prop.<br>2. Navigate to that route. |
| **Expected Result** | The content of the protected route should be rendered and visible. |

---

### Test Case 3: Access Granted - User Has Required Permissions

| Test Case ID | TC_PRIVATE_03                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user with the necessary permissions can access the route. |
| **Prerequisites** | The user is logged in and their role has the permissions `[can_view_reports]`. |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute` with `requiredPermissions={['can_view_reports']}`.<br>2. Navigate to that route. |
| **Expected Result** | The content of the protected route should be rendered and visible. |

---

### Test Case 4: Access Denied - User Lacks Required Permissions

| Test Case ID | TC_PRIVATE_04                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user without the necessary permissions is redirected. |
| **Prerequisites** | The user is logged in but does not have the permission `[can_edit_settings]`. |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute` with `requiredPermissions={['can_edit_settings']}`.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to the `redirectTo` path (default is `/unauthorized`). |

---

### Test Case 5: Access Denied - User Lacks One of Multiple Required Permissions

| Test Case ID | TC_PRIVATE_05                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify redirection if the user has only a subset of the required permissions. |
| **Prerequisites** | The user is logged in and has `[can_view_page]` but not `[can_edit_page]`. |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute` with `requiredPermissions={['can_view_page', 'can_edit_page']}`.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to the `/unauthorized` page. |

---

### Test Case 6: Loading State

| Test Case ID | TC_PRIVATE_06                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the loading fallback is shown while the authentication state is being determined. |
| **Prerequisites** | The Redux store is in a loading state (`isLoading: true`). |
| **Steps**      | 1. Configure a route to be wrapped by `PrivateRoute`.<br>2. Navigate to the route. |
| **Expected Result** | The `Loader` component should be displayed. |
