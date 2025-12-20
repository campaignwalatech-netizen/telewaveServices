
# Test Cases for AdminSidebar Component

**Component:** `src/adminDashboard/components/AdminSidebar.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-001 | It should render the sidebar with logo, menu, and user info. | 1. Render the `AdminSidebar` component with necessary props (`sidebarOpen`, `setSidebarOpen`, etc.). | The sidebar should display the "Freelancer" logo, a list of navigation items, user information, and a logout button. |
| ADS-002 | It should display the user's phone number and initial. | 1. Render the component with a `userPhone` prop (e.g., "1234567890"). | The user info section should display the phone number and the initial "1" in the avatar. |
| ADS-003 | It should show a default initial if `userPhone` is not provided. | 1. Render the component without the `userPhone` prop. | The user avatar should display the default initial "U". |

---

### 2. Navigation

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-004 | It should call the navigation function on menu item click. | 1. Render the component within a `MemoryRouter`. <br> 2. Click the "Users" menu item. | The `useNavigate` hook should be called to navigate to the "/admin/users" path. The sidebar should also close. |
| ADS-005 | It should highlight the active menu item based on the current route. | 1. Render the component in a `MemoryRouter` with the initial route set to "/admin/users". | The "Users" menu item should have the active styles applied (e.g., different background color). |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-006 | It should call the `handleLogout` function on logout button click. | 1. Render the component with a mock `handleLogout` function. <br> 2. Click the "Logout" button. | The `handleLogout` function should be called once. |
| ADS-007 | It should close the sidebar when the close button is clicked (mobile). | 1. Render the component with `sidebarOpen={true}`. <br> 2. Click the `X` button in the header of the sidebar. | The `setSidebarOpen` function should be called with `false`. |
| ADS-008 | It should close the sidebar when a navigation item is clicked. | 1. Render with `sidebarOpen={true}`. <br> 2. Click any menu item. | The `setSidebarOpen` function should be called with `false`. |

---

### 4. Mobile Responsiveness

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-009 | The sidebar should be hidden off-screen on mobile if `sidebarOpen` is false. | 1. Render with `sidebarOpen={false}` on a small screen. | The sidebar should have the `-translate-x-full` class, moving it off-screen. |
| ADS-010 | The sidebar should be visible on mobile if `sidebarOpen` is true. | 1. Render with `sidebarOpen={true}` on a small screen. | The sidebar should have the `translate-x-0` class, making it visible. |
| ADS-011 | The close button (`X`) should be hidden on large screens. | 1. Render the component on a large screen. | The `X` button should not be visible, as it is inside a `lg:hidden` element. |

---
