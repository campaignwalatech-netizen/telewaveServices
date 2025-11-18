
# Manual Test Cases for Incomplete Profile Page

## Test Suite: Incomplete Profile Page Functionality

**Objective:** To ensure the Incomplete Profile Page functions as expected, allowing admins to notify users to complete their profiles.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** IP-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Navigate to the Incomplete Profile Page.
-   **Expected Result:**
    -   The page title "Incomplete Profile Notifications" is visible.
    -   A list of users with incomplete profiles is displayed.
    -   Each user card shows their name, email, phone, completion percentage, and missing fields.
    -   The form for sending a notification is displayed with fields for "Title" and "Message".
    -   The "Send" button is disabled initially.

---

### **Test Case 2: User Search and Filtering**

-   **Test ID:** IP-02
-   **Description:** Verify that users can be searched and filtered.
-   **Steps:**
    1.  Use the search bar to search for a user by name, email, or phone.
    2.  Use the filter dropdown to filter users by completion priority (e.g., "High Priority").
-   **Expected Result:**
    -   The user list should filter based on the search query.
    -   The user list should filter based on the selected priority.

---

### **Test Case 3: User Selection**

-   **Test ID:** IP-03
-   **Description:** Verify that users can be selected for notification.
-   **Steps:**
    1.  Click on a user in the list to select them.
    2.  Click on the selected user again to deselect them.
    3.  Click the "Select All" button.
    4.  Click the "Clear All" button.
-   **Expected Result:**
    -   Clicking a user should mark them as selected.
    -   The "Selected Users" count in the notification form should update.
    -   "Select All" should select all visible users.
    -   "Clear All" should deselect all users.

---

### **Test Case 4: Notification Form**

-   **Test ID:** IP-04
-   **Description:** Verify that the notification form can be filled.
-   **Steps:**
    1.  Enter a title in the "Title" field.
    2.  Enter a message in the "Message" field.
-   **Expected Result:**
    -   The input values should be reflected in the form fields.
    -   The "Preview" section should update as the fields are filled.

---

### **Test Case 5: Send Notification**

-   **Test ID:** IP-05
-   **Description:** Verify that the notification is "sent" successfully.
-   **Steps:**
    1.  Fill out the "Title" and "Message" fields.
    2.  Select at least one user.
    3.  Click the "Send" button.
-   **Expected Result:**
    -   The "Send" button should show a loading state.
    -   A success message "Sent to X users!" should appear after a short delay.
    -   The form should reset, and the user selection should be cleared.

---

### **Test Case 6: Edge Case - No Users Selected**

-   **Test ID:** IP-06
-   **Description:** Verify that the "Send" button is disabled if no users are selected.
-   **Steps:**
    1.  Fill out the "Title" and "Message" fields.
    2.  Ensure no users are selected.
-   **Expected Result:**
    -   The "Send" button should be disabled.

---

### **Test Case 7: Edge Case - Empty Form Fields**

-   **Test ID:** IP-07
-   **Description:** Verify that the "Send" button is disabled if the title or message is empty.
-   **Steps:**
    1.  Select at least one user.
    2.  Clear the "Title" or "Message" field.
-   **Expected Result:**
    -   The "Send" button should be disabled.
