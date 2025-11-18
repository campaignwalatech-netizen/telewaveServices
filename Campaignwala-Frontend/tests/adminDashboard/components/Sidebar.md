
# Test Cases for Sidebar Component

**Component:** `src/adminDashboard/components/Sidebar.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-001 | It should render the sidebar with logo and menu items. | 1. Render the `Sidebar` component within a `MemoryRouter`. | The sidebar should display the "Campaignwala" logo and a list of top-level menu items. |
| ADS-002 | It should render submenus correctly. | 1. Render the component. <br> 2. Click on a menu item with a submenu (e.g., "Manage Account"). | The submenu items (e.g., "All Offers", "Add Offers") should become visible. |

---

### 2. Navigation and Routing

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-003 | It should navigate to the correct path on menu item click. | 1. Render in a `MemoryRouter`. <br> 2. Click on a menu item without a submenu (e.g., "Payment Withdrawal List"). | The application should navigate to the `/admin/payment-withdrawal` path. |
| ADS-004 | It should navigate correctly on submenu item click. | 1. Render, expand a menu, and click a submenu item (e.g., "All Offers"). | The application should navigate to the `/admin/all-Offers` path. |
| ADS-005 | It should highlight the active menu item. | 1. Render with the initial route set to `/admin/payment-withdrawal`. | The "Payment Withdrawal List" menu item should have the active link styles. |
| ADS-006 | It should highlight the active submenu item. | 1. Render with the initial route set to `/admin/all-Offers`. | The "All Offers" submenu item should have the active link styles. The parent "Manage Account" menu should also be expanded. |
| ADS-007 | It should automatically expand the parent menu of an active submenu item on initial render. | 1. Render with the initial route set to `/admin/all-categories`. | The "Manage Category" menu should be expanded by default, showing the active "All Categories" link. |

---

### 3. Mobile Responsiveness

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-008 | It should be hidden on mobile by default. | 1. Render on a small screen. | The sidebar should be off-screen. A hamburger menu button should be visible. |
| ADS-009 | It should open on mobile when the toggle button is clicked. | 1. Render on a small screen and click the toggle button. | The sidebar should slide into view. An overlay should cover the main content. |
| ADS-010 | It should close on mobile when the toggle button is clicked again. | 1. Open the sidebar on mobile. <br> 2. Click the `X` button. | The sidebar should slide out of view. |
| ADS-011 | It should close on mobile when the overlay is clicked. | 1. Open the sidebar on mobile. <br> 2. Click the overlay. | The sidebar should close. |
| ADS-012 | It should close on mobile when a navigation link is clicked. | 1. Open the sidebar on mobile. <br> 2. Click any `NavLink`. | The sidebar should close. |

---

### 4. State Management

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ADS-013 | It should toggle submenu visibility on click. | 1. Render the component. <br> 2. Click the "Leads" menu. <br> 3. Click the "Leads" menu again. | The "Leads" submenu should first open, then close. |
| ADS-014 | It should maintain the expanded state of multiple submenus. | 1. Render and open the "Leads" menu. <br> 2. Open the "User Management" menu. | Both submenus should remain open until explicitly closed. |

---
