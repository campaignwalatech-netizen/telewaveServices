# Manual Test Cases for Sidebar (User Dashboard)

**Component:** `src/userDashboard/components/Sidebar.jsx`

**Objective:** To verify the display, navigation, and collapsible functionality of the user dashboard sidebar.

---

### Test Case 1: Render the Sidebar (Expanded)

| Test Case ID | TC_SIDEBAR_01                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the sidebar renders correctly in its default, expanded state. |
| **Prerequisites** | The `isSidebarOpen` prop is `true`. |
| **Steps**      | 1. Log in as a user and view the dashboard. |
| **Expected Result** | The sidebar on the left should be visible and wide, displaying:<br>- A collapse button (left arrow icon).<br>- Menu items with icons and text labels (e.g., "Dashboard", "All Leads", "Wallet", "Profile"). |

---

### Test Case 2: Sidebar Collapse and Expand

| Test Case ID | TC_SIDEBAR_02                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the sidebar can be collapsed and expanded. |
| **Steps**      | 1. Click the collapse button (left arrow) at the top of the sidebar.<br>2. Observe the sidebar.<br>3. Click the expand button (right arrow).<br>4. Observe the sidebar. |
| **Expected Result** | - Clicking the collapse button should shrink the sidebar to a narrow bar showing only icons. The `toggleSidebar` function should be called.<br>- The collapse button's icon should change to an expand icon (right arrow).<br>- Clicking the expand button should restore the sidebar to its full width, showing icons and text labels again. |

---

### Test Case 3: Navigation

| Test Case ID | TC_SIDEBAR_03                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that clicking menu items navigates to the correct pages. |
| **Steps**      | 1. Click on the "Dashboard" menu item.<br>2. Click on the "All Leads" menu item.<br>3. Click on the "Wallet" menu item.<br>4. Click on the "Profile" menu item. |
| **Expected Result** | - Clicking "Dashboard" navigates to `/user`.<br>- Clicking "All Leads" navigates to `/user/all-leads`.<br>- Clicking "Wallet" navigates to `/user/wallet-withdrawl`.<br>- Clicking "Profile" navigates to `/user/profile-overview`. |

---

### Test Case 4: Active State Highlight

| Test Case ID | TC_SIDEBAR_04                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the currently active menu item is visually highlighted. |
| **Steps**      | 1. Navigate to `/user/all-leads`.<br>2. Observe the "All Leads" menu item in the sidebar.<br>3. Navigate to `/user/profile-overview`.<br>4. Observe the "Profile" menu item. |
| **Expected Result** | The menu item corresponding to the current URL path should have a different background color or style to indicate that it is active. |

---

### Test Case 5: Dark Mode Rendering

| Test Case ID | TC_SIDEBAR_05                                      |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the sidebar displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. Enable dark mode on the dashboard.<br>2. Observe the sidebar's appearance. |
| **Expected Result** | The sidebar should have a dark background color and light text/icon colors. The active item highlight should also be adjusted for dark mode. |
