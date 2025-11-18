
# Manual Test Cases for Admin Dashboard Page

## Test Suite: Admin Dashboard Page Functionality

**Objective:** To ensure the Admin Dashboard Page displays correctly and all components function as expected.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** DP-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Log in as an admin.
    2.  Navigate to the Dashboard Page.
-   **Expected Result:**
    -   The Admin Header and Sidebar are visible.
    -   The page title "Dashboard" or similar is visible.
    -   Stats cards for "Total Revenue", "Total Users", "Active Campaigns", and "New Leads" are displayed with data.
    -   A "Sales Overview" chart placeholder is visible.
    -   The "Recent Activity" feed is visible with a list of activities.

---

### **Test Case 2: Sidebar Functionality**

-   **Test ID:** DP-02
-   **Description:** Verify that the sidebar opens and closes correctly on mobile.
-   **Steps:**
    1.  View the page on a mobile screen size.
    2.  Click the menu icon in the header to open the sidebar.
    3.  Click the overlay to close the sidebar.
-   **Expected Result:**
    -   The sidebar should become visible when the menu icon is clicked.
    -   The sidebar should hide when the overlay is clicked.

---

### **Test Case 3: Logout Functionality**

-   **Test ID:** DP-03
-   **Description:** Verify that the logout button logs the user out.
-   **Steps:**
    1.  Click the logout button in the sidebar.
-   **Expected Result:**
    -   The user is redirected to the login page (`/`).
    -   The `isLoggedIn`, `userPhone`, and `userType` items are removed from local storage.

---

### **Test Case 4: Unauthorized Access**

-   **Test ID:** DP-04
-   **Description:** Verify that a non-admin user is redirected from the dashboard.
-   **Steps:**
    1.  Log in as a non-admin user.
    2.  Attempt to navigate to the admin dashboard page.
-   **Expected Result:**
    -   The user is redirected to the login page (`/`) or an unauthorized page.

---

### **Test Case 5: Stats Cards Display**

-   **Test ID:** DP-05
-   **Description:** Verify that the stats cards display the correct information.
-   **Steps:**
    1.  Observe the stats cards on the dashboard.
-   **Expected Result:**
    -   Each card should display a title, value, percentage change, and an icon.
