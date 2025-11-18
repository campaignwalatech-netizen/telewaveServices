# Manual Test Cases for Loader Component

## Test Suite: Loader Component Functionality

**Objective:** To ensure the Loader component displays correctly based on its props.

---

### **Test Case 1: Verify Default Loader**

-   **Test ID:** L-01
-   **Description:** Ensure the loader renders correctly with default props.
-   **Steps:**
    1.  Render the `Loader` component without any props.
-   **Expected Result:**
    -   A medium-sized loader should be visible.
    -   The text "Loading..." should be displayed below the loader.

---

### **Test Case 2: Verify Different Sizes**

-   **Test ID:** L-02
-   **Description:** Ensure the loader renders correctly with different sizes.
-   **Steps:**
    1.  Render the `Loader` component with `size="sm"`.
    2.  Render the `Loader` component with `size="md"`.
    3.  Render the `Loader` component with `size="lg"`.
-   **Expected Result:**
    -   The loader should be small, medium, and large respectively.
    -   The text size should also correspond to the loader size.

---

### **Test Case 3: Verify Custom Text**

-   **Test ID:** L-03
-   **Description:** Ensure the loader renders with custom text.
-   **Steps:**
    1.  Render the `Loader` component with `text="Please wait..."`.
-   **Expected Result:**
    -   The text "Please wait..." should be displayed below the loader.

---

### **Test Case 4: Verify No Text**

-   **Test ID:** L-04
-   **Description:** Ensure the loader renders without any text.
-   **Steps:**
    1.  Render the `Loader` component with `text=""`.
-   **Expected Result:**
    -   Only the loader should be visible, with no text below it.

---

### **Test Case 5: Verify Custom Class**

-   **Test ID:** L-05
-   **Description:** Ensure the loader accepts a custom `className`.
-   **Steps:**
    1.  Render the `Loader` component with `className="mt-8"`.
-   **Expected Result:**
    -   The loader component should have a top margin.