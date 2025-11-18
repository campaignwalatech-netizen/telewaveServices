
# Manual Test Scenarios for useSession.js

*These tests would be performed within a component that uses the `useSession` hook, likely with Redux state controlled by a testing utility.*

## 1. Session Warning

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SESS-001 | Show warning when session is expiring | 1. Log in. <br> 2. Set `sessionTimeRemaining` in Redux to be less than the `warningTime` (e.g., 4 minutes). <br> 3. Wait for the `checkInterval` to pass. | The `showWarning` state should become `true`. A session expiry warning UI should appear. |
| SESS-002 | Dismiss the session warning | 1. Trigger the session warning. <br> 2. Call the `dismissWarning` function (e.g., by clicking a "Dismiss" button). | `showWarning` should become `false`. The warning UI should disappear. The warning should not reappear on the next interval check. |

## 2. Session Extension

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SESS-003 | Extend session manually | 1. Trigger the session warning. <br> 2. Call `extendSession` (e.g., by clicking a "Stay Logged In" button). | The `updateLastActivity` action should be dispatched. `showWarning` should become `false`. The session time should be reset in Redux. |
| SESS-004 | Extend session via user activity | 1. Log in. <br> 2. Perform a user activity like clicking, scrolling, or typing. | The `updateLastActivity` action should be dispatched (respecting the throttle limit). |

## 3. Session Timeout

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SESS-005 | Automatic logout on session expiry | 1. Log in. <br> 2. Set `sessionTimeRemaining` in Redux to a small value (e.g., 1 second). <br> 3. Wait for the time to expire and the next `checkInterval` to run. | The `forceLogout` action should be dispatched. The user should be logged out and redirected to the login page. |
| SESS-006 | Manual logout | 1. Log in. <br> 2. Call the `logout` function. | The `forceLogout` action should be dispatched immediately. The user should be logged out. |

## 4. State and Formatted Time

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SESS-007 | Verify formatted time remaining | 1. Set `sessionTimeRemaining` to `150000` (2 minutes 30 seconds). <br> 2. Inspect the `timeRemaining` object from the hook. | The object should be `{ minutes: 2, seconds: 30, formatted: '02:30', total: 150000 }`. |
| SESS-008 | `isExpiringSoon` flag | 1. Set `sessionTimeRemaining` to be less than `warningTime`. | The `isExpiringSoon` flag should be `true`. |
| SESS-009 | `isExpired` flag | 1. Set `sessionTimeRemaining` to `0` or less. | The `isExpired` flag should be `true`. |

## 5. Authentication State Changes

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| SESS-010 | Cleanup on logout | 1. Log in. <br> 2. Log out. | The session check interval should be cleared. All activity event listeners should be removed. |
| SESS-011 | Reset warning on login | 1. Log in, let the session expire so `warningShownRef` is true. <br> 2. Log in again. | The `warningShownRef` should be reset to `false`, allowing the warning to be shown again for the new session. |
