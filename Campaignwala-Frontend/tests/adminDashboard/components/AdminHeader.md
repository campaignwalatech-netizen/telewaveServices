
# Test Cases for AdminHeader Component

**Component:** `src/adminDashboard/components/AdminHeader.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-001 | It should render the header with the title. | 1. Render the `AdminHeader` component within a `ThemeProvider`. | The header should display the title "Admin Dashboard". |
| ADH-002 | It should render the mobile menu button. | 1. Render the component. | A button with a `Menu` icon should be visible (this button is hidden on large screens). |
| ADH-003 | It should render the theme toggle button. | 1. Render the component within a `ThemeProvider`. | A button to toggle the color theme should be visible. |

---

### 2. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-004 | It should call the `setSidebarOpen` function on mobile menu click. | 1. Render the component with a mock `setSidebarOpen` function. <br> 2. Click the mobile menu button. | The `setSidebarOpen` function should be called with `true`. |
| ADH-005 | It should toggle the theme on button click. | 1. Render the component within a `ThemeProvider`. <br> 2. Note the current theme (e.g., light). <br> 3. Click the theme toggle button. | The application's theme should switch (e.g., from light to dark). The icon inside the button should update accordingly (e.g., from Moon to Sun). |

---

### 3. Theme Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-006 | It should display the `Moon` icon in light mode. | 1. Render the component in a `ThemeProvider` with the theme set to `light`. | The theme toggle button should display the `Moon` icon. |
| ADH-007 | It should display the `Sun` icon in dark mode. | 1. Render the component in a `ThemeProvider` with the theme set to `dark`. | The theme toggle button should display the `Sun` icon. |

---

### 4. Accessibility

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-008 | The mobile menu button should have an accessible label. | 1. Render the component. <br> 2. Inspect the mobile menu button. | The button should have an `aria-label` with the value "Open menu". |
| ADH-009 | The theme toggle button should have an accessible label. | 1. Render the component. <br> 2. Inspect the theme toggle button. | The button should have an `aria-label` with the value "Toggle theme". |

---
