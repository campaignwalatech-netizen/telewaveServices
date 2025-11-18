
# Manual Test Cases for Hot Offers Page

## Test Suite: Hot Offers Page Functionality

**Objective:** To ensure the Hot Offers Page functions as expected, allowing admins to create, target, and send promotional offers to users.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** HO-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Navigate to the Hot Offers Page.
-   **Expected Result:**
    -   The page title "Hot Offers Notifications" is visible.
    -   The form for creating a hot offer is displayed with fields for "Offer Title", "Discount", "Expiry Date", and "Description".
    -   The "Target User Segments" section is visible with different user segments.
    -   The "Offer Preview" section is visible.
    -   The "Send" button is disabled initially.

---

### **Test Case 2: Form Input and Validation**

-   **Test ID:** HO-02
-   **Description:** Verify that the form fields can be filled and basic validation works.
-   **Steps:**
    1.  Enter a title in the "Offer Title" field.
    2.  Enter a number in the "Discount" field.
    3.  Enter a description in the "Description" field.
    4.  Select a date in the "Expiry Date" field.
    5.  Clear one of the required fields (e.g., "Offer Title").
-   **Expected Result:**
    -   The input values should be reflected in the form fields.
    -   The "Offer Preview" should update as the fields are filled.
    -   The "Send" button should remain disabled if any of the required fields are empty.

---

### **Test Case 3: User Segmentation**

-   **Test ID:** HO-03
-   **Description:** Verify that user segments can be selected and deselected.
-   **Steps:**
    1.  Click on one or more user segments (e.g., "Active Users", "Premium Users").
    2.  Observe the "Users in Selected Segments" list.
    3.  Click on a selected segment again to deselect it.
    4.  Click the "Select All" button.
    5.  Click the "Clear All" button.
-   **Expected Result:**
    -   When a segment is selected, the users belonging to that segment should appear in the list below.
    -   The total number of recipients in the preview should update.
    -   Deselecting a segment should remove its users from the list.
    -   "Select All" should select all segments.
    -   "Clear All" should deselect all segments.

---

### **Test Case 4: User Search and Selection**

-   **Test ID:** HO-04
-   **Description:** Verify that users can be searched and individually selected.
-   **Steps:**
    1.  Select a user segment to populate the user list.
    2.  Use the search bar to search for a user by name, email, or phone.
    3.  Click on a user in the list to select them.
    4.  Click on the selected user again to deselect them.
    5.  Click "Select All Visible" and "Clear Selection".
-   **Expected Result:**
    -   The user list should filter based on the search query.
    -   Clicking a user should highlight them as selected.
    -   The total number of recipients should update to reflect individual selections.
    -   The selection control buttons should work as expected.

---

### **Test Case 5: Send Notification**

-   **Test ID:** HO-05
-   **Description:** Verify that the notification is "sent" successfully.
-   **Steps:**
    1.  Fill out all the required form fields.
    2.  Select at least one user segment or individual user.
    3.  Click the "Send" button.
-   **Expected Result:**
    -   The "Send" button should show a loading state.
    -   A success message "Bulk Hot Offer Sent Successfully!" should appear after a short delay.
    -   The form should reset after the success message is displayed.

---

### **Test Case 6: Edge Case - No Recipients**

-   **Test ID:** HO-06
-   **Description:** Verify that the "Send" button is disabled if no recipients are selected.
-   **Steps:**
    1.  Fill out all the required form fields.
    2.  Ensure no user segments or individual users are selected.
-   **Expected Result:**
    -   The "Send" button should be disabled.
