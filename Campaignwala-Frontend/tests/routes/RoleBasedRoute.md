# Manual Test Cases for RoleBasedRoute

**Component:** `RoleBasedRoute.jsx`

**Objective:** To verify that the `RoleBasedRoute` component correctly protects routes based on the user's assigned role.

---

### Test Case 1: Access Granted for Correct Role

| Test Case ID | TC_ROLE_01                                         |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user with the correct role can access the route. |
| **Prerequisites** | The user is logged in with the 'admin' role. |
| **Steps**      | 1. Configure a route (e.g., `/admin`) to be wrapped by `RoleBasedRoute` with `role="admin"`.<br>2. Navigate to that route. |
| **Expected Result** | The content of the protected route should be rendered and visible. |

---

### Test Case 2: Access Denied for Incorrect Role

| Test Case ID | TC_ROLE_02                                         |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user with an incorrect role is redirected. |
| **Prerequisites** | The user is logged in with the 'user' role. |
| **Steps**      | 1. Configure a route (e.g., `/admin`) to be wrapped by `RoleBasedRoute` with `role="admin"`.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to their own dashboard (e.g., `/user`). The content of the admin route should not be visible. |

---

### Test Case 3: Access Denied for Unauthenticated User

| Test Case ID | TC_ROLE_03                                         |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a guest user is redirected to the login page. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Configure a route to be wrapped by `RoleBasedRoute` (e.g., with `role="admin"`).<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to the login page (`/`). |

---

### Test Case 4: Loading State

| Test Case ID | TC_ROLE_04                                         |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a fallback loader is shown while authentication is checked. |
| **Prerequisites** | The Redux store is in a loading state. |
| **Steps**      | 1. Configure a route to be wrapped by `RoleBasedRoute`.<br>2. Navigate to the route. |
| **Expected Result** | A `Loader` component should be displayed. (Note: The current implementation of `RoleBasedRoute` does not have a loading state, but this is a good test case for future improvements). |

---

### Test Case 5: Role Mismatch - Admin trying to access User route

| Test Case ID | TC_ROLE_05                                         |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an admin user is redirected from a user-only route. |
| **Prerequisites** | The user is logged in as an 'admin'. |
| **Steps**      | 1. Configure a route (e.g., `/user`) to be wrapped by `RoleBasedRoute` with `role="user"`.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to their own dashboard (`/admin`). |
