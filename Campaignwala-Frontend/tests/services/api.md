
# Manual Test Plan for API Service

## Objective
To ensure that the `axios` instance is configured correctly, interceptors are working as expected, and helper functions are reliable.

## Tools
-   Browser with developer tools (Network and Application tabs)

## Test Cases

### 1. Request Interceptor
-   **Steps:**
    1.  Log in to the application.
    2.  Navigate to a page that makes an API request.
    3.  Open the Network tab in the developer tools and inspect the request headers.
-   **Expected Result:**
    -   The request header should include an `Authorization` field with a `Bearer` token.

### 2. Response Interceptor (Token Refresh)
-   **Steps:**
    1.  Log in to the application.
    2.  Manually expire the `accessToken` in local storage (e.g., by changing its value).
    3.  Make an API request (e.g., by navigating to a new page).
-   **Expected Result:**
    -   The initial API request should fail with a 401 Unauthorized error.
    -   The response interceptor should automatically make a request to the `/auth/refresh-token` endpoint.
    -   A new `accessToken` should be stored in local storage.
    -   The original API request should be retried with the new token and succeed.

### 3. API Helpers
-   **`setAuthToken` and `clearAuthToken`:**
    -   **Steps:**
        1.  In the browser console, call `apiHelpers.setAuthToken('my-test-token')`.
        2.  Check local storage and `api.defaults.headers.common`.
        3.  Call `apiHelpers.clearAuthToken()`.
        4.  Check local storage and headers again.
    -   **Expected Result:**
        -   `setAuthToken` should add the token to local storage and the default headers.
        -   `clearAuthToken` should remove the token.
-   **`isAuthenticated`:**
    -   **Steps:**
        1.  Call `apiHelpers.isAuthenticated()` in the console before and after logging in.
    -   **Expected Result:**
        -   Should return `false` when logged out and `true` when logged in.
-   **`createFormData`:**
    -   **Steps:**
        1.  Call `apiHelpers.createFormData({ a: 1, b: 'test' })` in the console.
    -   **Expected Result:**
        -   Should return a `FormData` object with the correct key-value pairs.
