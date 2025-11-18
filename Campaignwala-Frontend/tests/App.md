# Manual Test Scenarios for App.jsx

## 1. Layout and Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APP-001 | Verify main layout components | 1. Log in as an admin and navigate to the dashboard. | The `Sidebar` should be visible on the left. The `Header` should be visible at the top of the main content area. The content for the current route (from `<Outlet />`) should be displayed below the header. |

## 2. Theme Management

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APP-002 | Toggle theme from light to dark | 1. Ensure the theme is currently light. <br> 2. Click the theme toggle button in the `Header`. | The application's appearance should switch to dark mode. The `localStorage` key 'theme' should be updated to 'dark'. |
| APP-003 | Toggle theme from dark to light | 1. Ensure the theme is currently dark. <br> 2. Click the theme toggle button in the `Header`. | The application's appearance should switch to light mode. The `localStorage` key 'theme' should be updated to 'light'. |
| APP-004 | Theme persistence on refresh | 1. Set the theme to dark. <br> 2. Refresh the page. | The application should load with the dark theme already applied. |

## 3. Session Management

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APP-005 | User activity updates session | 1. Open the Redux DevTools to monitor actions. <br> 2. Click, scroll, or type anywhere in the application. | The `auth/updateLastActivity` action should be dispatched to the Redux store. |