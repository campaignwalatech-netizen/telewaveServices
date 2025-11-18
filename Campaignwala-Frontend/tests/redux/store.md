
# Manual Test Plan for Redux Store

## Objective
To ensure that the Redux store is correctly configured and functioning as expected within the application.

## Tools
-   Browser with Redux DevTools extension

## Test Cases

### 1. Store Initialization
-   **Steps:**
    1.  Load the application in the browser.
    2.  Open Redux DevTools.
-   **Expected Result:**
    -   The Redux store should be initialized without any errors.
    -   The state chart in Redux DevTools should show the initial state of the application, including the `auth` slice.

### 2. State Changes on Actions
-   **Steps:**
    1.  Perform actions in the application that are expected to dispatch Redux actions (e.g., logging in, logging out).
    2.  Observe the action log and state changes in Redux DevTools.
-   **Expected Result:**
    -   Actions should be dispatched correctly.
    -   The state should be updated accordingly by the reducers.
    -   For example, after a successful login, the `auth` slice of the state should reflect the authenticated user's data.

### 3. Middleware
-   **Steps:**
    1.  Check the configuration in `src/redux/store.js` to see what middleware is being used.
    2.  If there is any custom middleware, perform actions that would trigger it.
-   **Expected Result:**
    -   The middleware should execute as expected (e.g., logging actions to the console, handling asynchronous logic).
