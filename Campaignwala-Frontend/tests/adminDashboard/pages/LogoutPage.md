
# Manual Test Plan for Logout Page

## Objective
To ensure that the logout page correctly logs the user out and redirects them to the login page.

## Test Cases

### 1. Logout and Redirection
-   **Steps:**
    1.  Log in to the admin dashboard.
    2.  Navigate to the logout page (`/admin/logout`).
-   **Expected Result:**
    -   A "Logging out..." message should be displayed.
    -   After a short delay (around 1 second), the user should be automatically redirected to the login page (`/login`).
    -   Any authentication tokens or session data should be cleared.
