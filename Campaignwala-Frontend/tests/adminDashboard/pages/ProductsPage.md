
# Manual Test Cases for Products Page

## Test Suite: Products Page Functionality

**Objective:** To ensure the Products Page functions as expected, allowing admins to manage products.

---

### **Test Case 1: Verify Page Renders Correctly**

-   **Test ID:** PP-01
-   **Description:** Ensure all UI elements are displayed correctly when the page loads.
-   **Steps:**
    1.  Log in as an admin.
    2.  Navigate to the Products Page.
-   **Expected Result:**
    -   The Admin Header and Sidebar are visible.
    -   The page title "Offers" is visible.
    -   The "Add Product" button is visible.
    -   A list of products is displayed in a grid format.
    -   Each product card shows the product name, category, price, stock, status, and buttons for "Edit" and "Delete".

---

### **Test Case 2: Add Product Button**

-   **Test ID:** PP-02
-   **Description:** Verify that the "Add Product" button is present and appears clickable.
-   **Steps:**
    1.  Click the "Add Product" button.
-   **Expected Result:**
    -   A modal or a new page should open to add a new product (or a console log/alert for now, as the functionality is not implemented).

---

### **Test Case 3: Product Card Display**

-   **Test ID:** PP-03
-   **Description:** Verify that the product cards display the correct information and styling.
-   **Steps:**
    1.  Observe the product cards.
-   **Expected Result:**
    -   The status of the product ("In Stock", "Low Stock", "Out of Stock") should have a different color code.
    -   All product details (name, category, price, stock) should be visible.

---

### **Test Case 4: Edit and Delete Buttons**

-   **Test ID:** PP-04
-   **Description:** Verify that the "Edit" and "Delete" buttons are present on each product card.
-   **Steps:**
    1.  Click the "Edit" button on a product.
    2.  Click the "Delete" button on a product.
-   **Expected Result:**
    -   Clicking "Edit" should open a modal or a new page for editing the product (or a console log/alert).
    -   Clicking "Delete" should show a confirmation dialog before deleting the product (or a console log/alert).

---

### **Test Case 5: Sidebar and Header**

-   **Test ID:** PP-05
-   **Description:** Verify that the sidebar and header are functional.
-   **Steps:**
    1.  On a mobile screen, click the menu icon in the header to open the sidebar.
    2.  Click the logout button in the sidebar.
-   **Expected Result:**
    -   The sidebar should open and close correctly.
    -   The user should be logged out and redirected to the login page.
