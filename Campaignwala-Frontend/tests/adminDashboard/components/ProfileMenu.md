
# Test Cases for ProfileMenu Component

**Component:** `src/adminDashboard/components/ProfileMenu.jsx`

---

### 1. Basic Rendering and State

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PM-001 | It should render the profile button. | 1. Render the `ProfileMenu` component within a `MemoryRouter`. | A button with a `User` icon should be visible. The dropdown menu should be hidden by default. |
| PM-002 | It should open the dropdown menu on click. | 1. Render the component. <br> 2. Click the profile button. | The dropdown menu should appear, showing user info, a "Settings" button, and a "Logout" button. |
| PM-003 | It should close the dropdown on a second click. | 1. Render and click the profile button to open the menu. <br> 2. Click the profile button again. | The dropdown menu should disappear. |
| PM-004 | It should close the dropdown when clicking outside. | 1. Render and open the menu. <br> 2. Click anywhere on the page outside of the menu. | The dropdown menu should disappear. |

---

### 2. Dropdown Content

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PM-005 | It should display the correct user information. | 1. Render and open the dropdown. | The text "Admin User" and "admin@freelancer.com" should be visible. |
| PM-006 | It should contain a "Settings" button. | 1. Render and open the dropdown. | A button with the text "Settings" and a `Settings` icon should be present. |
| PM-007 | It should contain a "Logout" button. | 1. Render and open the dropdown. | A button with the text "Logout" and a `LogOut` icon should be present. |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PM-008 | The "Settings" button should be clickable. | 1. Render and open the dropdown. <br> 2. Click the "Settings" button. | The button should be interactive. No navigation is implemented for this button in the code. |
| PM-009 | It should handle the logout action correctly. | 1. Render the component. <br> 2. Set a dummy item in `localStorage` (e.g., `localStorage.setItem("isLoggedIn", "true")`). <br> 3. Open the dropdown and click "Logout". | `localStorage` items should be removed. The app should navigate to the "/login" page. The dropdown should close. |

---

### 4. Accessibility

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PM-010 | The profile button should have an accessible label. | 1. Render the component. <br> 2. Inspect the profile button element. | The button should have an `aria-label` with the value "Profile menu". |

---
