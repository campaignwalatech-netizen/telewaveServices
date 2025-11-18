
# Manual Test Scenarios for usePermissions.js

*These tests would be performed within a component that uses the `usePermissions` hook.*

## 1. `hasPermission` Function

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PERM-001 | User has the required permission | 1. Set user role to 'user' and permissions to `['dashboard.read']`. <br> 2. Call `hasPermission('dashboard.read')`. | Returns `true`. |
| PERM-002 | User does not have the required permission | 1. Set user role to 'user' and permissions to `[]`. <br> 2. Call `hasPermission('dashboard.read')`. | Returns `false`. |
| PERM-003 | Admin role check | 1. Set user role to 'admin' and permissions to `[]`. <br> 2. Call `hasPermission('any.permission')`. | Returns `true`, as admin should have all permissions. |
| PERM-004 | Null permission check | 1. Call `hasPermission(null)`. | Returns `true`. |

## 2. `hasAllPermissions` and `hasAnyPermission`

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PERM-005 | `hasAllPermissions` - success | 1. Set permissions to `['a', 'b', 'c']`. <br> 2. Call `hasAllPermissions(['a', 'b'])`. | Returns `true`. |
| PERM-006 | `hasAllPermissions` - failure | 1. Set permissions to `['a', 'b']`. <br> 2. Call `hasAllPermissions(['a', 'c'])`. | Returns `false`. |
| PERM-007 | `hasAnyPermission` - success | 1. Set permissions to `['a']`. <br> 2. Call `hasAnyPermission(['a', 'b', 'c'])`. | Returns `true`. |
| PERM-008 | `hasAnyPermission` - failure | 1. Set permissions to `['d']`. <br> 2. Call `hasAnyPermission(['a', 'b', 'c'])`. | Returns `false`. |

## 3. Role-based Flags

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PERM-009 | `isAdmin` flag | 1. Set user role to 'admin'. | `isAdmin` should be `true`, others `false`. |
| PERM-010 | `isUser` flag | 1. Set user role to 'user'. | `isUser` should be `true`, others `false`. |
| PERM-011 | `isGuest` flag | 1. Set user role to `null` or 'guest'. | `isGuest` should be `true`, others `false`. |

## 4. Feature Permissions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PERM-012 | `getFeaturePermissions` | 1. Set permissions to `['dashboard.read', 'dashboard.write']`. <br> 2. Call `getFeaturePermissions('dashboard')`. | Returns `{ canRead: true, canWrite: true, canDelete: false, canAdmin: false, all: ['dashboard.read', 'dashboard.write'] }`. |

## 5. Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PERM-013 | `updatePermissions` action | 1. Call `updatePermissions(['new.permission'])`. <br> 2. Check the Redux store and the hook's `permissions` state. | The `setPermissions` action should be dispatched with the new permissions. The local `permissions` state should update. The permission cache should be cleared. |
| PERM-014 | `clearPermissionCache` action | 1. Call `hasPermission('a')` to cache a result. <br> 2. Call `clearPermissionCache()`. | The internal `permissionCache` map should be cleared. |
