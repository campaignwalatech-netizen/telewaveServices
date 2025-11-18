
# Test Cases for ProfileMenu Component

**Component:** `src/components/profile.jsx`

---

### 1. Basic Rendering and State

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PRF-001 | It should render the profile button. | 1. Render the `ProfileMenu` component. | A circular button with a `User` icon should be visible. The dropdown menu should be hidden by default. |
| PRF-002 | It should open the dropdown menu on click. | 1. Render the component. <br> 2. Click the profile button. | The dropdown menu should appear, showing the user's name, email, a "Settings" button, and a "Logout" button. |
| PRF-003 | It should close the dropdown menu on a second click. | 1. Render the component. <br> 2. Click the profile button to open the menu. <br> 3. Click the profile button again. | The dropdown menu should disappear. |
| PRF-004 | It should close the dropdown when clicking outside. | 1. Render the component and click the profile button to open the menu. <br> 2. Click anywhere on the page outside of the dropdown menu. | The dropdown menu should disappear. |

---

### 2. Dropdown Content

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PRF-005 | It should display the correct user information. | 1. Render the component and open the dropdown. | The text "Admin User" and "admin@freelancer.com" should be visible. |
| PRF-006 | It should contain a "Settings" button. | 1. Render the component and open the dropdown. | A button with the text "Settings" and a `Settings` icon should be present. |
| PRF-007 | It should contain a "Logout" button. | 1. Render the component and open the dropdown. | A button with the text "Logout" and a `LogOut` icon should be present. The button should have text styles indicating a destructive action. |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PRF-008 | The "Settings" button should be clickable. | 1. Render the component and open the dropdown. <br> 2. Click the "Settings" button. | The button should be interactive (e.g., show a hover/focus state). No specific navigation is implemented in the code. |
| PRF-009 | It should handle the logout action. | 1. Render the component and open the dropdown. <br> 2. Open the browser console. <br> 3. Click the "Logout" button. | The dropdown menu should close, and the message "Logging out..." should be printed to the console. |

---

### 4. Accessibility

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PRF-010 | The profile button should have an accessible label. | 1. Render the component. <br> 2. Inspect the profile button element. | The button should have an `aria-label` attribute with the value "Profile menu". |

---
