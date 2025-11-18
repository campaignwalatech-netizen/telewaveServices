
# Manual Test Plan for Settings Page

## Objective
To ensure that the admin settings page functions correctly, allowing the user to manage their account settings.

## Test Cases

### 1. Page Rendering
-   **Steps:**
    1.  Navigate to the admin settings page (`/admin/settings`).
-   **Expected Result:**
    -   The page should display the title "Account Settings".
    -   The user's profile information (avatar, name, email) should be visible.
    -   Settings options for "Email Notifications", "Dark Mode", and "Change Password" should be present.

### 2. Email Notifications Toggle
-   **Steps:**
    1.  Click the toggle switch for "Email Notifications".
-   **Expected Result:**
    -   The toggle switch should change its state (on/off).
    -   (If applicable) The application should reflect the change in email notification preferences.

### 3. Dark Mode Toggle
-   **Steps:**
    1.  Click the toggle switch for "Dark Mode".
-   **Expected Result:**
    -   The toggle switch should change its state (on/off).
    -   The application's theme should switch between light and dark mode accordingly.
    -   The preference should be saved in `localStorage` and persist across page reloads.

### 4. Change Password Navigation
-   **Steps:**
    1.  Click the "Change" button next to "Change Password".
-   **Expected Result:**
    -   The user should be redirected to the reset password page (`/admin/reset-password`).
