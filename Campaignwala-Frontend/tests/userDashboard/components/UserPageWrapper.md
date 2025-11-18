# Manual Test Cases for UserPageWrapper

**Component:** `src/userDashboard/components/UserPageWrapper.jsx`

**Objective:** To verify that the `UserPageWrapper` correctly protects user dashboard pages and provides the main layout structure.

---

### Test Case 1: Access Granted for Authenticated User

| Test Case ID | TC_WRAPPER_01                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a correctly authenticated 'user' can access the content wrapped by this component. |
| **Prerequisites** | - `localStorage` has `isLoggedIn` set to `"true"`.<br>- `localStorage` has `userType` set to `"user"`. |
| **Steps**      | 1. Navigate to a URL that renders a component wrapped in `UserPageWrapper`. |
| **Expected Result** | The child content should be rendered and visible within the standard user dashboard layout (Sidebar, Navbar, Footer). The user should not be redirected. |

---

### Test Case 2: Access Denied - Not Logged In

| Test Case ID | TC_WRAPPER_02                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user who is not logged in is redirected to the login page. |
| **Prerequisites** | - `localStorage` does not have `isLoggedIn` set to `"true"`. |
| **Steps**      | 1. Attempt to navigate to a URL protected by `UserPageWrapper`. |
| **Expected Result** | The user should be immediately redirected to the login page (`/`). |

---

### Test Case 3: Access Denied - Incorrect Role

| Test Case ID | TC_WRAPPER_03                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user with a role other than 'user' is redirected. |
| **Prerequisites** | - `localStorage` has `isLoggedIn` set to `"true"`.<br>- `localStorage` has `userType` set to `"admin"`. |
| **Steps**      | 1. Attempt to navigate to a URL protected by `UserPageWrapper`. |
| **Expected Result** | The user should be redirected to the login page (`/`). |

---

### Test Case 4: Layout Rendering

| Test Case ID | TC_WRAPPER_04                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the wrapper correctly renders the main layout components. |
| **Prerequisites** | The user is properly authenticated as a 'user'. |
| **Steps**      | 1. Navigate to a page wrapped by `UserPageWrapper`. |
| **Expected Result** | The page should display:<br>- The `Sidebar` component.<br>- The `Navbar` component.<br>- The `Footer` component.<br>- The `children` content passed to the wrapper. |

---

### Test Case 5: Dark Mode State

| Test Case ID | TC_WRAPPER_05                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the component correctly initializes and manages the dark mode state. |
| **Steps**      | 1. Set `localStorage` key `theme` to `"dark"`.<br>2. Refresh a page wrapped by `UserPageWrapper`.<br>3. Observe the UI.<br>4. Use the theme toggle in the `Navbar` to change the theme. |
| **Expected Result** | - The component should initialize in dark mode if the `localStorage` key is set.<br>- The `darkMode` state should be passed correctly to child components (`Sidebar`, etc.).<br>- The theme should update correctly when toggled. |
