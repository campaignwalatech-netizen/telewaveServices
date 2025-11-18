
# Manual Test Cases for Notification History Page

## Test Suite: Notification History Page Functionality

**Objective:** To ensure the Notification History Page functions as expected, allowing admins to view, filter, and manage sent notifications.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** NH-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Navigate to the Notification History Page.
-   **Expected Result:**
    -   The page title "Notification History" is visible.
    -   A list of notifications is displayed.
    -   A search bar and filter buttons are visible.
    -   A details view is visible, initially showing a message to select a notification.

---

### **Test Case 2: Search and Filter Notifications**

-   **Test ID:** NH-02
-   **Description:** Verify that notifications can be searched and filtered.
-   **Steps:**
    1.  Use the search bar to search for a notification by title or message.
    2.  Click on the filter buttons (e.g., "Profile", "Offers").
-   **Expected Result:**
    -   The notification list should filter based on the search query.
    -   The notification list should filter based on the selected type.

---

### **Test Case 3: View Notification Details**

-   **Test ID:** NH-03
-   **Description:** Verify that clicking a notification displays its details.
-   **Steps:**
    1.  Click on a notification from the list.
-   **Expected Result:**
    -   The details view should update to show the title, type, status, recipients, sent date, and message of the selected notification.

---

### **Test Case 4: Delete Notification**

-   **Test ID:** NH-04
-   **Description:** Verify that a notification can be deleted.
-   **Steps:**
    1.  Select a notification from the list.
    2.  Click the delete (trash can) button in the details view.
-   **Expected Result:**
    -   The selected notification should be removed from the list.
    -   The details view should revert to the initial state or show the details of another notification.

---

### **Test Case 5: Back Navigation**

-   **Test ID:** NH-05
-   **Description:** Verify that the back button navigates to the dashboard.
-   **Steps:**
    1.  Click the "Back to Dashboard" button.
-   **Expected Result:**
    -   The user is redirected to the `/admin/notifications` page.
