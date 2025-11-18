
# Test Cases for UsersTable Component

**Component:** `src/adminDashboard/forms/UsersTable.jsx`

---

### 1. Basic Rendering and Data Fetching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UT-001 | It should render the table with a dynamic title based on `userType`. | 1. Render the `UsersTable` component with `userType="active"`. | The title "Active Users" should be visible. |
| UT-002 | It should display a loading state while fetching users. | 1. Render the component. <br> 2. Mock the `userService.getAllUsersWithStats` to have a delay. | A loading spinner with the text "Loading users..." should be visible. |
| UT-003 | It should fetch and display a table of users. | 1. Mock a successful response from `getAllUsersWithStats`. <br> 2. Render the component. | A table of users should be displayed with correct data. |
| UT-004 | It should filter users based on the `userType` prop. | 1. Mock a response with users of different statuses. <br> 2. Render with `userType="hold"`. | The table should only display users where `isActive` is false and `isEx` is not true. |
| UT-005 | It should display an error message if fetching fails. | 1. Mock a failed response from the service. <br> 2. Render the component. | An error message with a "Retry" button should be displayed. |

---

### 2. Filtering and Searching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UT-006 | It should filter users by search term. | 1. Render with a list of users. <br> 2. Type a user's name into the search input. | The `fetchUsers` function should be called, and the table should update to show only matching users. |
| UT-007 | It should filter users by lead count. | 1. Render with users having different lead counts. <br> 2. Select "High Leads (>30)" from the filter dropdown. | The table should update to show only users with more than 30 total leads. |

---

### 3. User Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UT-008 | The "View" button should open the view modal. | 1. Click the "View" button on a user row. | The modal should appear, displaying the details for that user. |
| UT-009 | The "Edit" button should open the edit modal. | 1. Click the "Edit" button on a user row. | The edit modal should appear, pre-filled with the user's data. |
| UT-010 | It should show status change options on hover. | 1. Hover the mouse over the status badge of a user. | A dropdown or set of buttons should appear with options to change the user's status (e.g., "Active", "Hold", "Ex"). |
| UT-011 | It should call the correct service when changing a user's status. | 1. Hover over a status and click a new status (e.g., click "Hold" for an active user). <br> 2. Mock the `userService` functions. | The `userService.toggleUserStatus` or `userService.markUserAsEx` function should be called with the correct user ID. |
| UT-012 | It should show a success alert after a status change. | 1. Mock a successful response from the status change API. <br> 2. Change a user's status. | An alert with a success message should appear, and the user list should be re-fetched. |

---

### 4. Modals and Other Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UT-013 | The view modal should close correctly. | 1. Open the view modal. <br> 2. Click the `X` button. | The modal should disappear. |
| UT-014 | The edit modal should close and show a success alert on save. | 1. Open the edit modal. <br> 2. Click "Save Changes". | The modal should close, and an alert "User updated successfully!" should appear. |
| UT-015 | The "Export" button should show an alert. | 1. Render the component. <br> 2. Click the "Export" button. | An alert "Export functionality will be implemented soon!" should appear. |

---
