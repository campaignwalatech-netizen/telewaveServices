# Manual Test Cases for AppRouter

**Component:** `AppRouter.jsx`

**Objective:** To verify that the main application router correctly navigates users to the appropriate pages based on the URL and their authentication status and role.

---

### Test Case 1: Public Routes

| Test Case ID | TC_ROUTER_01                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that unauthenticated users can access public routes. |
| **Steps**      | 1. As a guest user (not logged in), navigate to `/`.<br>2. Navigate to `/register`.<br>3. Navigate to `/verify-otp`. |
| **Expected Result** | - The `LoginPage` should be rendered for `/`.<br>- The `RegisterPage` should be rendered for `/register`.<br>- The `OtpVerification` page should be rendered for `/verify-otp`. |

---

### Test Case 2: Redirect Authenticated User from Public Routes

| Test Case ID | TC_ROUTER_02                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that authenticated users are redirected away from public, restricted routes. |
| **Prerequisites** | The user is logged in as a 'user'. |
| **Steps**      | 1. Navigate to `/`. |
| **Expected Result** | The user should be redirected to their dashboard (e.g., `/user`). |

---

### Test Case 3: Admin Route Access - Authorized

| Test Case ID | TC_ROUTER_03                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an admin user can access admin-specific routes. |
| **Prerequisites** | The user is logged in as an 'admin'. |
| **Steps**      | 1. Navigate to `/admin`.<br>2. Navigate to `/admin/all-offers`. |
| **Expected Result** | The admin dashboard/layout should be rendered, showing the content for the respective admin pages. |

---

### Test Case 4: Admin Route Access - Unauthorized

| Test Case ID | TC_ROUTER_04                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a non-admin user is redirected from admin routes. |
| **Prerequisites** | The user is logged in as a 'user'. |
| **Steps**      | 1. Attempt to navigate to `/admin/all-offers`. |
| **Expected Result** | The user should be redirected to their own dashboard (`/user`) or an unauthorized page. |

---

### Test Case 5: User Route Access - Authorized

| Test Case ID | TC_ROUTER_05                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a 'user' can access their dashboard routes. |
| **Prerequisites** | The user is logged in as a 'user'. |
| **Steps**      | 1. Navigate to `/user`.<br>2. Navigate to `/user/all-leads`. |
| **Expected Result** | The user dashboard should be rendered with the content for the respective pages. |

---

### Test Case 6: User Route Access - Unauthorized

| Test Case ID | TC_ROUTER_06                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a guest user is redirected from user routes. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Attempt to navigate to `/user/dashboard`. |
| **Expected Result** | The user should be redirected to the login page (`/`). |

---

### Test Case 7: Fallback/Not Found Route

| Test Case ID | TC_ROUTER_07                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that navigating to a non-existent route redirects correctly. |
| **Steps**      | 1. Navigate to a URL that does not exist, e.g., `/some/random/path`. |
| **Expected Result** | The user should be redirected to the main fallback route, which in this case appears to be the login page (`/`). |

---

### Test Case 8: Public Share Link

| Test Case ID | TC_ROUTER_08                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that anyone can access the public share link. |
| **Steps**      | 1. As any user (guest or authenticated), navigate to `/share/some-offer/some-user`. |
| **Expected Result** | The `SharedOfferForm` component should be rendered. |
