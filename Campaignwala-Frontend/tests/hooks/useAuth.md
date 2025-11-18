
# Manual Test Cases for useAuth Hook

## Test Suite: useAuth Hook Functionality

**Objective:** To ensure the useAuth hook provides correct authentication state and functions.

---

### **Test Case 1: Verify Initial State**

-   **Test ID:** AUTH-01
-   **Description:** Ensure the hook returns the correct initial state from the Redux store.
-   **Steps:**
    1.  Render a component that uses the `useAuth` hook with an initial Redux state where the user is not authenticated.
-   **Expected Result:**
    -   `isAuthenticated` should be `false`.
    -   `user` should be `null`.
    -   `userRole` should be `null`.
    -   `isLoading` should be `false`.
    -   `error` should be `null`.

---

### **Test Case 2: Login Action**

-   **Test ID:** AUTH-02
-   **Description:** Verify the login function dispatches the correct action and navigates on success.
-   **Steps:**
    1.  Render a component that uses the `useAuth` hook.
    2.  Call the `login` function with valid credentials for an admin user.
    3.  Call the `login` function with valid credentials for a regular user.
-   **Expected Result:**
    -   The `loginUser` action should be dispatched to the Redux store.
    -   On success, the user should be navigated to the `/admin` dashboard for admin users.
    -   On success, the user should be navigated to the `/user` dashboard for regular users.

---

### **Test Case 3: Logout Action**

-   **Test ID:** AUTH-03
-   **Description:** Verify the logout function dispatches the correct action and navigates.
-   **Steps:**
    1.  Log in as a user.
    2.  Call the `logout` function.
-   **Expected Result:**
    -   The `logoutUser` action should be dispatched.
    -   The user should be navigated to the home page (`/`).

---

### **Test Case 4: Register Action**

-   **Test ID:** AUTH-04
-   **Description:** Verify the register function dispatches the correct action and navigates.
-   **Steps:**
    1.  Call the `register` function with valid user details.
-   **Expected Result:**
    -   The `registerUser` action should be dispatched.
    -   The user should be navigated to the `/user` dashboard.

---

### **Test Case 5: Error Handling**

-   **Test ID:** AUTH-05
-   **Description:** Verify that authentication errors are correctly reported.
-   **Steps:**
    1.  Call the `login` function with invalid credentials.
-   **Expected Result:**
    -   The `error` state variable in the hook should be updated with the error message from the Redux store.

---

### **Test Case 6: Clear Error**

-   **Test ID:** AUTH-06
-   **Description:** Verify the `clearAuthError` function dispatches the `clearError` action.
-   **Steps:**
    1.  Trigger an authentication error.
    2.  Call the `clearAuthError` function.
-   **Expected Result:**
    -   The `clearError` action should be dispatched.
    -   The `error` state variable should be reset to `null`.
