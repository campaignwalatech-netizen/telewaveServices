# Manual Test Cases for PublicRoute

**Component:** `PublicRoute.jsx`

**Objective:** To verify that the `PublicRoute` component correctly handles access for authenticated and unauthenticated users.

---

### Test Case 1: Access Public Route as Guest

| Test Case ID | TC_PUBLICROUTE_01                                  |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an unauthenticated user can access a public route. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Configure a route (e.g., `/login`) to be wrapped by `PublicRoute`.<br>2. Navigate to that route. |
| **Expected Result** | The content of the public route (e.g., the `LoginPage` component) should be rendered and visible. |

---

### Test Case 2: Access Public Route as Authenticated User (Restricted)

| Test Case ID | TC_PUBLICROUTE_02                                  |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an authenticated user is redirected away from a restricted public route. |
| **Prerequisites** | The user is logged in (e.g., as a 'user'). |
| **Steps**      | 1. Configure a route (e.g., `/login`) to be wrapped by `PublicRoute` with the default `restricted=true` prop.<br>2. Attempt to navigate to that route. |
| **Expected Result** | The user should be redirected to their corresponding dashboard (e.g., `/user`). The content of the public route should not be visible. |

---

### Test Case 3: Access Public Route as Authenticated User (Not Restricted)

| Test Case ID | TC_PUBLICROUTE_03                                  |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an authenticated user can access a public route that is not restricted. |
| **Prerequisites** | The user is logged in. |
| **Steps**      | 1. Configure a public route to be wrapped by `PublicRoute` with `restricted=false`.<br>2. Navigate to that route. |
| **Expected Result** | The content of the public route should be rendered and visible. The user should not be redirected. |

---

### Test Case 4: Loading State

| Test Case ID | TC_PUBLICROUTE_04                                  |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the loading fallback is shown while the authentication state is being determined. |
| **Prerequisites** | The Redux store is in a loading state (`isLoading: true`). |
| **Steps**      | 1. Configure a route to be wrapped by `PublicRoute`.<br>2. Navigate to the route. |
| **Expected Result** | The `Loader` component (or the specified fallback) should be displayed instead of the route's content or a redirect. |
