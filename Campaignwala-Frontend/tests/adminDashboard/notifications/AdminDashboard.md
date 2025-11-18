
# Manual Test Cases for Admin Notification Dashboard

## Test Suite: Admin Notification Dashboard Functionality

**Objective:** To ensure the Admin Notification Dashboard provides correct navigation and information.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** AD-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Navigate to the Admin Notification Dashboard.
-   **Expected Result:**
    -   The page title "Admin Notification Center" is visible.
    -   The "Incomplete Profile" card is visible.
    -   The "Hot Offers" card is visible.
    -   The "Notification History" button is visible.
    -   The "Recent Notifications" section is visible with a list of notifications.

---

### **Test Case 2: Navigation to Incomplete Profile Page**

-   **Test ID:** AD-02
-   **Description:** Verify that clicking the "Incomplete Profile" card navigates to the correct page.
-   **Steps:**
    1.  Click on the "Incomplete Profile" card.
-   **Expected Result:**
    -   The user is redirected to the `/admin/notifications/incomplete-profile` page.

---

### **Test Case 3: Navigation to Hot Offers Page**

-   **Test ID:** AD-03
-   **Description:** Verify that clicking the "Hot Offers" card navigates to the correct page.
-   **Steps:**
    1.  Click on the "Hot Offers" card.
-   **Expected Result:**
    -   The user is redirected to the `/admin/notifications/hot-offers` page.

---

### **Test Case 4: Navigation to Notification History Page**

-   **Test ID:** AD-04
-   **Description:** Verify that clicking the "Notification History" button navigates to the correct page.
-   **Steps:**
    1.  Click on the "Notification History" button.
-   **Expected Result:**
    -   The user is redirected to the `/admin/notifications/history` page.

---

### **Test Case 5: Recent Notifications Display**

-   **Test ID:** AD-05
-   **Description:** Verify that the recent notifications are displayed correctly.
-   **Steps:**
    1.  Observe the "Recent Notifications" section.
-   **Expected Result:**
    -   A list of recent notifications is displayed, showing the title, number of recipients, and time sent.
