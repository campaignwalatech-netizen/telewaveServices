# Manual Test Scenarios for useNavigation.js

*These tests would be performed within a component that uses the `useNavigation` hook.*

## 1. Initialization and Menu Loading

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| NAV-001 | Verify initial state | 1. Render a component that uses `useNavigation()`. | The hook's `activeKey` should default to 'dashboard'. `breadcrumbs` and `navigationHistory` should be initialized correctly. |
| NAV-002 | Load admin menu | 1. Render the hook with `userType` set to 'admin'. | The `menu` variable in the hook should be populated with `NAVIGATION_MENU.ADMIN`. |
| NAV-003 | Load user menu | 1. Render the hook with `userType` set to 'user'. | The `menu` variable should be populated with `NAVIGATION_MENU.USER`. |
| NAV-004 | Fallback to empty menu | 1. Render the hook with an unknown `userType`. | The `menu` should be an empty array. |

## 2. Permission Filtering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| NAV-005 | Filter menu with sufficient permissions | 1. Set user permissions to include `['read:users', 'write:products']`. <br> 2. Render the hook. | The returned `menu` should include items that require `'read:users'` or `'write:products'`, as well as items with no permission requirements. |
| NAV-006 | Filter menu with insufficient permissions | 1. Set user permissions to `[]`. <br> 2. Render the hook. | The returned `menu` should only include items that do not have a `permissions` property. Items requiring permissions should be filtered out. |

## 3. Navigation Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| NAV-007 | `navigateToItem` functionality | 1. Call `navigateToItem('products', { key: 'products', label: 'Products' })`. | `activeKey` should become 'products'. `navigationHistory` should contain the new item. `breadcrumbs` should be updated to show "Products". |
| NAV-008 | `navigateToItem` with a child item | 1. Call `navigateToItem('all-products', { key: 'all-products', label: 'All Products' })` (assuming it's a child of 'Products'). | `activeKey` should be 'all-products'. `breadcrumbs` should show "Products / All Products". |
| NAV-009 | `goBack` functionality | 1. Navigate to 'dashboard', then to 'products'. <br> 2. Call `goBack()`. | `activeKey` should revert to 'dashboard'. `navigationHistory` should be updated. |
| NAV-010 | `goBack` with no history | 1. On initial load, call `goBack()`. | The state should not change. `activeKey` should remain 'dashboard'. |
| NAV-011 | `resetNavigation` functionality | 1. Navigate to several different items. <br> 2. Call `resetNavigation()`. | `activeKey` should be reset to 'dashboard'. `breadcrumbs` and `navigationHistory` should be reset to their initial state. |

## 4. Context and Data Retrieval

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| NAV-012 | `getCurrentMenuItem` | 1. Call `navigateToItem('products', ...)`. <br> 2. Inspect the value of `currentMenuItem`. | It should return the full menu item object for the 'products' key. |
| NAV-013 | `getNavigationContext` | 1. Navigate to a few items. <br> 2. Inspect the value of `navigationContext`. | It should return an object containing the correct `currentItem`, `menu`, `breadcrumbs`, `canGoBack` status, and the `previousItem`. |
| NAV-014 | `canGoBack` status | 1. On initial load, check `navigationContext.canGoBack`. <br> 2. Navigate to a new item. <br> 3. Check `navigationContext.canGoBack` again. | It should be `false` initially, and `true` after the second navigation. |