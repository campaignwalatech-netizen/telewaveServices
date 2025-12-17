
# Test Cases for Sidebar Component

**Component:** `src/components/Sidebar.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SDB-001 | It should render the sidebar with a logo and menu items. | 1. Render the `Sidebar` component. | The sidebar should be visible on large screens, displaying the "Freelancewala" logo and a list of navigation links. |
| SDB-002 | It should render all menu items correctly. | 1. Render the component. | The sidebar should contain all the menu items defined in the `menuItems` array, each with an icon and a label. |
| SDB-003 | It should highlight the active menu item. | 1. Render the component. | The "All Offers" menu item should have a different background color and text style to indicate it is the active link. |

---

### 2. Mobile Behavior

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SDB-004 | It should be hidden by default on mobile screens. | 1. Render the component on a small screen (e.g., less than 1024px wide). | The sidebar should not be visible. A hamburger menu button should be visible in the top-left corner. |
| SDB-005 | It should open when the mobile toggle button is clicked. | 1. Render on a small screen. <br> 2. Click the hamburger menu button. | The sidebar should slide in from the left. An overlay should cover the rest of the page content. The toggle button should now show an `X` icon. |
| SDB-006 | It should close when the toggle button is clicked again. | 1. On a small screen, open the sidebar by clicking the toggle. <br> 2. Click the `X` icon. | The sidebar should slide out of view. The overlay should disappear. The toggle button should revert to the hamburger icon. |
| SDB-007 | It should close when the overlay is clicked. | 1. On a small screen, open the sidebar. <br> 2. Click the dark overlay area outside the sidebar. | The sidebar should slide out of view and the overlay should disappear. |
| SDB-008 | It should close when a menu item is clicked on mobile. | 1. On a small screen, open the sidebar. <br> 2. Click any of the menu items (e.g., "Manage Leads"). | The sidebar should close. |

---

### 3. Content and Links

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SDB-009 | It should render the correct logo and title. | 1. Render the component. | The sidebar should display a logo with "CW" and the text "Freelancewala". |
| SDB-010 | Menu items should have the correct `href` attributes. | 1. Render the component. <br> 2. Inspect the "Manage Account" link. | The `<a>` tag for this item should have `href="#"`. (Note: In a real app, this would be a specific route). |

---

### 4. Accessibility

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SDB-011 | The mobile toggle button should have an accessible label. | 1. Render the component on a small screen. <br> 2. Inspect the toggle button. | The button should have an `aria-label` with the value "Toggle menu". |

---
