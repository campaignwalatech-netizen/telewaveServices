
# Manual Test Plan for Navigation Service

## Objective
To ensure that the navigation logic, including role-based access control and redirects, works correctly throughout the application.

## Test Cases

### 1. Role-Based Navigation Menus
-   **Steps:**
    1.  Log in as an **admin** user.
    2.  Observe the navigation menu.
    3.  Log out and log in as a **user**.
    4.  Observe the navigation menu.
-   **Expected Result:**
    -   The admin user should see the admin navigation menu.
    -   The user should see the user navigation menu.

### 2. Role-Based Route Access
-   **Steps:**
    1.  Log in as a **user**.
    2.  Attempt to navigate directly to an admin-only route (e.g., `/admin/users`).
    3.  Log in as an **admin**.
    4.  Attempt to navigate to a user-only route (e.g., `/user/profile`).
-   **Expected Result:**
    -   The user should be redirected from the admin route to their default dashboard or an unauthorized page.
    -   The admin should be redirected from the user route.

### 3. Public Route Access
-   **Steps:**
    1.  Log out of the application.
    2.  Attempt to navigate to public routes (e.g., `/login`, `/about`).
-   **Expected Result:**
    -   The user should be able to access all public routes without being redirected.

### 4. Protected Route Redirect (as Guest)
-   **Steps:**
    1.  Log out of the application.
    2.  Attempt to navigate directly to a protected route (e.g., `/admin/dashboard`).
-   **Expected Result:**
    -   The user should be redirected to the login page.
    -   After logging in, the user should be redirected to the originally intended route (`/admin/dashboard`).

### 5. Default Redirects on Login
-   **Steps:**
    1.  Log in as an **admin** without a specific intended route.
    2.  Log out and log in as a **user** without a specific intended route.
-   **Expected Result:**
    -   The admin should be redirected to the admin dashboard.
    -   The user should be redirected to the user dashboard.

### 6. Breadcrumbs
-   **Steps:**
    1.  Navigate through different pages of the application.
-   **Expected Result:**
    -   The breadcrumb trail should accurately reflect the current location in the site hierarchy.
