
# Manual Test Cases for Users Page

## Test Suite: Users Page Functionality

**Objective:** To ensure the Users Page functions as expected, allowing admins to manage users.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** UP-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Log in as an admin.
    2.  Navigate to the Users Page.
-   **Expected Result:**
    -   The Admin Header and Sidebar are visible.
    -   The page title "Users Management" is visible.
    -   The "Add User" button is visible.
    -   A search bar and filter button are visible.
    -   A table of users is displayed with columns for Name, Email, Phone, Role, Status, and Actions.

---

### **Test Case 2: Search and Filter Users**

-   **Test ID:** UP-02
-   **Description:** Verify that users can be searched.
-   **Steps:**
    1.  Use the search bar to search for a user by name.
-   **Expected Result:**
    -   The user table should filter to show only the users matching the search term.

---

### **Test Case 3: Add User Button**

-   **Test ID:** UP-03
-   **Description:** Verify that the "Add User" button is present and appears clickable.
-   **Steps:**
    1.  Click the "Add User" button.
-   **Expected Result:**
    -   A modal or a new page should open to add a new user (or a console log/alert for now, as the functionality is not implemented).

---

### **Test Case 4: User Table Actions**

-   **Test ID:** UP-04
-   **Description:** Verify that the "Edit" and "Delete" buttons in the user table are present.
-   **Steps:**
    1.  Observe the "Actions" column in the user table.
-   **Expected Result:**
    -   Each row should have an "Edit" and a "Delete" button.
    -   Clicking "Edit" should open a modal or a new page for editing the user.
    -   Clicking "Delete" should show a confirmation dialog before deleting the user.

---

### **Test Case 5: User Status and Role Display**

-   **Test ID:** UP-05
-   **Description:** Verify that the user status and role are displayed with correct styling.
-   **Steps:**
    1.  Observe the "Status" and "Role" columns in the user table.
-   **Expected Result:**
    -   The status ("Active", "Inactive") should have a different color code.
    -   The role of the user should be clearly displayed.
