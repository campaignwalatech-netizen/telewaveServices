
# Manual Test Plan for Session Manager

## Objective
To ensure that the session management service correctly handles user inactivity, session timeouts, and token refreshes.

## Test Cases

### 1. Session Timeout on Inactivity
-   **Steps:**
    1.  Log in to the application.
    2.  Remain inactive (no mouse movements, clicks, or keyboard input) for the duration of the session timeout (e.g., 30 minutes).
-   **Expected Result:**
    -   The user should be automatically logged out.
    -   A session expired message or notification should be displayed.
    -   The user should be redirected to the login page.

### 2. Session Extension on Activity
-   **Steps:**
    1.  Log in to the application.
    2.  Wait for a period of time less than the session timeout (e.g., 15 minutes).
    3.  Perform some activity (e.g., move the mouse, click a button).
    4.  Wait for another period of time that, when added to the previous wait time, exceeds the session timeout (e.g., another 20 minutes).
-   **Expected Result:**
    -   The user should remain logged in, as the session should have been extended by the activity.

### 3. Session Warning Notification
-   **Steps:**
    1.  Log in to the application.
    2.  Remain inactive until the session warning time is reached (e.g., 25 minutes for a 30-minute session with a 5-minute warning).
-   **Expected Result:**
    -   A notification (either in-app or a browser notification) should appear, warning that the session is about to expire.

### 4. Token Refresh
-   **Steps:**
    1.  Log in to the application.
    2.  Open the browser's developer tools and monitor network traffic.
    3.  Remain active in the application.
-   **Expected Result:**
    -   A request to the token refresh endpoint should be made periodically (e.g., every 5 minutes) to keep the session alive.

### 5. Manual Logout
-   **Steps:**
    1.  Log in to the application.
    2.  Click the logout button.
-   **Expected Result:**
    -   The session manager's timers and event listeners should be destroyed.
    -   The user should be logged out and redirected to the login page.
