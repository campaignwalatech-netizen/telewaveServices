
# Manual Test Cases for ThemeContext

## Test Suite: ThemeContext Functionality

**Objective:** To ensure the ThemeContext provides theme management functionalities as expected.

---

### **Test Case 1: Verify Default Theme**

-   **Test ID:** TC-01
-   **Description:** Ensure the default theme is applied correctly on initial render.
-   **Steps:**
    1.  Clear `localStorage`.
    2.  Render a component that uses the `useTheme` hook inside a `ThemeProvider`.
-   **Expected Result:**
    -   The initial theme should be `light`.
    -   The `<html>` element should not have the `dark` class.

---

### **Test Case 2: Verify Theme from LocalStorage**

-   **Test ID:** TC-02
-   **Description:** Ensure the theme is loaded from `localStorage` if it exists.
-   **Steps:**
    1.  Set the `theme` in `localStorage` to `dark`.
    2.  Render a component that uses the `useTheme` hook inside a `ThemeProvider`.
-   **Expected Result:**
    -   The initial theme should be `dark`.
    -   The `<html>` element should have the `dark` class.

---

### **Test Case 3: Toggle Theme**

-   **Test ID:** TC-03
-   **Description:** Ensure the theme can be toggled.
-   **Steps:**
    1.  Render a component that uses the `useTheme` hook and displays a button to toggle the theme.
    2.  Click the toggle button.
-   **Expected Result:**
    -   If the initial theme is `light`, it should change to `dark`.
    -   If the initial theme is `dark`, it should change to `light`.
    -   The `theme` in `localStorage` should be updated accordingly.
    -   The `dark` class on the `<html>` element should be added or removed accordingly.

---

### **Test Case 4: useTheme Hook Outside Provider**

-   **Test ID:** TC-04
-   **Description:** Ensure the `useTheme` hook throws an error when used outside of a `ThemeProvider`.
-   **Steps:**
    1.  Render a component that uses the `useTheme` hook without a `ThemeProvider` as an ancestor.
-   **Expected Result:**
    -   An error should be thrown with the message "useTheme must be used within a ThemeProvider".
