
# Test Cases for Header Component

**Component:** `src/adminDashboard/components/Header.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-001 | It should render the header with a dynamic title. | 1. Render the `Header` component within a `MemoryRouter` at a specific path (e.g., `/admin/users`). | The header should display the title corresponding to the path (e.g., "USERS"). |
| ADH-002 | It should display the default title for the root path. | 1. Render the component at the root admin path (`/admin` or `/admin/`). | The header should display the default title "ALL Offers". |
| ADH-003 | It should render the theme toggle button and profile menu. | 1. Render the component. | A theme toggle button and the `ProfileMenu` component should be visible. |

---

### 2. Data Fetching and Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-004 | It should fetch and display the active users count. | 1. Render the component with a mocked `userService` that returns a successful response with a number of active users. | The component should display the correct count of active users (e.g., "10 active users"). |
| ADH-005 | It should handle the singular case for one active user. | 1. Mock the `userService` to return one active user. | The text should correctly display "1 active user". |
| ADH-006 | It should handle the case where fetching users fails. | 1. Mock the `userService` to throw an error. | The component should display "0 active users" and log an error to the console. |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-007 | It should call the `onThemeToggle` function on button click. | 1. Render the component with a mock `onThemeToggle` function. <br> 2. Click the theme toggle button. | The `onThemeToggle` function should be called once. |
| ADH-008 | It should show an alert when the export button is clicked. | 1. Render the component. <br> 2. Click the "Export" button. | An alert with the message "Exporting data..." should appear. |

---

### 4. Theme and Styling

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADH-009 | It should display the `Moon` icon in light mode. | 1. Render the component with `isDark={false}`. | The theme toggle button should contain the `Moon` icon. |
| ADH-010 | It should display the `Sun` icon in dark mode. | 1. Render the component with `isDark={true}`. | The theme toggle button should contain the `Sun` icon. |

---
