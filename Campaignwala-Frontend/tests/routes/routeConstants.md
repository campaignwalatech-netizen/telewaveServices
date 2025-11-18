
# Manual Test Plan for Route Constants

## Objective
To ensure that all route constants and navigation structures are correctly defined and implemented throughout the application.

## Test Cases

### 1. Route Constant Verification
-   **Steps:**
    1.  Navigate to each page/route defined in `PUBLIC_ROUTES`, `ADMIN_ROUTES`, and `USER_ROUTES`.
-   **Expected Result:**
    -   Each route should load the correct component and page content.
    -   There should be no broken links or 404 errors for any defined route.

### 2. Default Redirects
-   **Steps:**
    1.  Log in as an **admin** user. You should be redirected to the admin dashboard.
    2.  Log in as a **user**. You should be redirected to the user dashboard.
    3.  As a logged-out user, try to access a protected route. You should be redirected to the login page.
-   **Expected Result:**
    -   Redirects should work as defined in `DEFAULT_REDIRECTS`.

### 3. Navigation Menus
-   **Steps:**
    1.  Log in as an **admin** and verify that the navigation menu matches the structure defined in `NAVIGATION_MENU.ADMIN`.
    2.  Log in as a **user** and verify that the navigation menu matches the structure defined in `NAVIGATION_MENU.USER`.
    3.  Click on each item in the navigation menus (including nested items).
-   **Expected Result:**
    -   Each menu item should navigate to the correct route.
    -   The menu structure in the UI should accurately reflect the constants.

### 4. Route Configuration
-   **Steps:**
    1.  Test the access control for routes defined in `ROUTE_CONFIG`.
    2.  As a **user**, try to access an `ADMIN_ONLY` route.
    3.  As a logged-in user, try to access a `PUBLIC` route that is `restricted` (e.g., the login page).
-   **Expected Result:**
    -   Access control and redirects should behave as specified in `ROUTE_CONFIG`.
