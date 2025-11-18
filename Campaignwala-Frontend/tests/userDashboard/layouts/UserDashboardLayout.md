# Manual Test Cases for UserDashboardLayout Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **UDL-1** | **Verify component rendering** | 1. Navigate to any page within the user dashboard. | The `UserDashboardLayout` should render, displaying the Navbar, Sidebar, and the content of the current page via the Outlet. | |
| **UDL-2** | **Verify sidebar toggle (open/close)** | 1. Click the sidebar toggle button in the Navbar. | The sidebar should expand or collapse. The main content area should adjust its margin accordingly. | |
| **UDL-3** | **Verify dark mode toggle** | 1. Click the dark mode toggle button in the Navbar. | The application should switch between light and dark themes. | |
| **UDL-4** | **Verify Outlet rendering** | 1. Navigate between different pages in the user dashboard (e.g., from Dashboard to Profile). | The main content area should update to display the correct page content. | |
| **UDL-5** | **Verify Footer rendering** | 1. Scroll to the bottom of any user dashboard page. | The `Footer` component should be visible. | |