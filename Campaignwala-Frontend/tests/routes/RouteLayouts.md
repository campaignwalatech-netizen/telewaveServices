# Manual Test Cases for RouteLayouts

**Component:** `RouteLayouts.jsx`

**Objective:** To verify that the various route layout components correctly protect their child routes based on user roles by properly utilizing the `ProtectedRoute` component.

---

### Test Case 1: AdminRouteLayout - Access Granted

| Test Case ID | TC_LAYOUT_01                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an admin user can access routes within the `AdminRouteLayout`. |
| **Prerequisites** | The user is logged in as an 'admin'. |
| **Steps**      | 1. Configure a set of routes to be children of `AdminRouteLayout` (e.g., via an `<Outlet />`).<br>2. Navigate to one of these child routes. |
| **Expected Result** | The content of the child route should be rendered and visible. |

---

### Test Case 2: AdminRouteLayout - Access Denied

| Test Case ID | TC_LAYOUT_02                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a non-admin user is redirected from the `AdminRouteLayout`. |
| **Prerequisites** | The user is logged in as a 'user'. |
| **Steps**      | 1. Configure routes within `AdminRouteLayout`.<br>2. Attempt to navigate to one of the child routes. |
| **Expected Result** | The user should be redirected to an unauthorized page (`/unauthorized`). |

---

### Test Case 3: UserRouteLayout - Access Granted

| Test Case ID | TC_LAYOUT_03                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a 'user' can access routes within the `UserRouteLayout`. |
| **Prerequisites** | The user is logged in as a 'user'. |
| **Steps**      | 1. Configure routes within `UserRouteLayout`.<br>2. Navigate to one of the child routes. |
| **Expected Result** | The content of the child route should be rendered. |

---

### Test Case 4: UserRouteLayout - Access Denied

| Test Case ID | TC_LAYOUT_04                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a non-user (e.g., admin) is redirected from the `UserRouteLayout`. |
| **Prerequisites** | The user is logged in as an 'admin'. |
| **Steps**      | 1. Configure routes within `UserRouteLayout`.<br>2. Attempt to navigate to one of the child routes. |
| **Expected Result** | The user should be redirected to an unauthorized page. |

---

### Test Case 5: AuthenticatedRouteLayout - Access Granted

| Test Case ID | TC_LAYOUT_05                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that any authenticated user can access the `AuthenticatedRouteLayout`. |
| **Prerequisites** | The user is logged in with any role (e.g., 'user', 'admin', 'moderator'). |
| **Steps**      | 1. Configure routes within `AuthenticatedRouteLayout`.<br>2. Navigate to one of the child routes. |
| **Expected Result** | The content of the child route should be rendered. |

---

### Test Case 6: AuthenticatedRouteLayout - Access Denied

| Test Case ID | TC_LAYOUT_06                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a guest user is redirected from the `AuthenticatedRouteLayout`. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Configure routes within `AuthenticatedRouteLayout`.<br>2. Attempt to navigate to one of the child routes. |
| **Expected Result** | The user should be redirected to the login page (`/`). |
