
# Test Cases for DebugCredentials Component

**Component:** `src/components/DebugCredentials.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DBG-001 | It should render the component with credentials and a button. | 1. Render the `DebugCredentials` component. | The component should display the heading "Debug Credentials", a button with the text "Test Credentials in Console", and the user and admin credentials. |

---

### 2. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DBG-002 | It should log test credentials to the console when the button is clicked. | 1. Open the browser's developer console. <br> 2. Render the `DebugCredentials` component. <br> 3. Click the "Test Credentials in Console" button. | The console should log the results of the credential tests, including checks for both user and admin credentials. The output should show `true` for all matches. |

---

### 3. Content Verification

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DBG-003 | It should display the correct user credentials. | 1. Render the `DebugCredentials` component. | The text "User: 9876543211 / user123" should be visible. |
| DBG-004 | It should display the correct admin credentials. | 1. Render the `DebugCredentials` component. | The text "Admin: 9876543210 / admin123" should be visible. |

---
