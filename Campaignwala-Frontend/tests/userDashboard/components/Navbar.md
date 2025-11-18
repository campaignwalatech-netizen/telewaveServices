# Manual Test Cases for Navbar (User Dashboard)

**Component:** `src/userDashboard/components/Navbar.jsx`

**Objective:** To verify the display, functionality, and responsiveness of the user dashboard's navigation bar.

---

### Test Case 1: Render the Navbar

| Test Case ID | TC_NAVBAR_01                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the navbar renders correctly with all its default elements. |
| **Steps**      | 1. Log in as a user and navigate to the user dashboard. |
| **Expected Result** | The navbar at the top of the page should display:<br>- The brand logo/name ("Campaignwala").<br>- A search bar (on desktop).<br>- A search icon (on mobile).<br>- A theme toggle button (Sun/Moon icon).<br>- A notifications button.<br>- A user profile avatar. |

---

### Test Case 2: Theme Toggle Functionality

| Test Case ID | TC_NAVBAR_02                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the dark/light mode theme can be toggled. |
| **Steps**      | 1. Click the theme toggle button (Sun or Moon icon).<br>2. Observe the UI.<br>3. Click the button again. |
| **Expected Result** | Clicking the button should switch the application's theme between light and dark modes. The icon should update accordingly (Sun for dark mode, Moon for light mode). The `setDarkMode` prop function should be called. |

---

### Test Case 3: Profile Menu Dropdown

| Test Case ID | TC_NAVBAR_03                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the profile menu opens and closes correctly. |
| **Steps**      | 1. Click the user profile avatar.<br>2. Observe the dropdown menu.<br>3. Click the avatar again.<br>4. Re-open the menu and click outside of it. |
| **Expected Result** | - A dropdown menu should appear upon the first click, showing "Profile" and "Logout" options.<br>- The menu should close when the avatar is clicked again.<br>- The menu should close when the user clicks anywhere outside the menu. |

---

### Test Case 4: Profile Menu Navigation

| Test Case ID | TC_NAVBAR_04                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify the navigation links within the profile menu. |
| **Steps**      | 1. Open the profile menu.<br>2. Click the "Profile" button. |
| **Expected Result** | The user should be navigated to the user profile page (`/user/profile`). |

---

### Test Case 5: Logout Functionality

| Test Case ID | TC_NAVBAR_05                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the logout button works correctly. |
| **Steps**      | 1. Open the profile menu.<br>2. Click the "Logout" button. |
| **Expected Result** | - The `localStorage` should be cleared.<br>- The user should be redirected to the login page (`/`). |

---

### Test Case 6: Mobile Sidebar Toggle

| Test Case ID | TC_NAVBAR_06                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the mobile menu (hamburger) icon toggles the sidebar. |
| **Prerequisites** | The browser window is sized to a mobile width where the hamburger icon is visible. |
| **Steps**      | 1. Click the hamburger menu icon. |
| **Expected Result** | The `toggleSidebar` prop function should be called, which should open/close the mobile sidebar. |

---

### Test Case 7: Mobile Search

| Test Case ID | TC_NAVBAR_07                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the mobile search UI can be opened. |
| **Prerequisites** | The browser window is sized to a mobile width. |
| **Steps**      | 1. Click the search icon. |
| **Expected Result** | A search input field should appear below the main navbar. |

---

### Test Case 8: Notifications Navigation

| Test Case ID | TC_NAVBAR_08                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the notifications button navigates to the notifications page. |
| **Steps**      | 1. Click the bell (notifications) icon. |
| **Expected Result** | The user should be navigated to the notifications page (`/user/notification-page`). |
