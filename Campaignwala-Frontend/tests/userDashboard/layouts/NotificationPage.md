# Manual Test Cases for NotificationPage

**Component:** `src/userDashboard/layouts/NotificationPage.jsx`

**Objective:** To verify the display and functionality of the user notifications page.

---

### Test Case 1: Render the Notifications Page

| Test Case ID | TC_NOTIFICATION_01                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page renders correctly with a list of notifications. |
| **Steps**      | 1. Navigate to the `/user/notification-page`. |
| **Expected Result** | The page should display:<br>- The title "Notifications".<br>- A "Mark all as read" button.<br>- A list of notifications, each with a title, message, and timestamp.<br>- Unread notifications should have a different style (e.g., a blue dot or a different background color). |

---

### Test Case 2: "Mark all as read" Functionality

| Test Case ID | TC_NOTIFICATION_02                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that clicking the "Mark all as read" button updates the state of all notifications. |
| **Steps**      | 1. Observe that there is at least one unread notification.<br>2. Click the "Mark all as read" button. |
| **Expected Result** | All notifications in the list should now appear as read (e.g., the blue dot or special background color should disappear). |

---

### Test Case 3: Notification Type Styling

| Test Case ID | TC_NOTIFICATION_03                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that notifications have distinct styling based on their type (success, warning, info). |
| **Steps**      | 1. Observe the list of notifications. |
| **Expected Result** | - The "KYC Verification Pending" notification should have a warning style (e.g., yellow icon/colors).<br>- The "Withdrawal Request Approved" notification should have a success style (e.g., green icon/colors).<br>- The "Profile Update Successful" notification should have an info style (e.g., blue icon/colors). |

---

### Test Case 4: Empty State

| Test Case ID | TC_NOTIFICATION_04                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an empty state message is shown if there are no notifications. |
| **Prerequisites** | The component's initial `notifications` state is an empty array. |
| **Steps**      | 1. Render the component with no notifications. |
| **Expected Result** | The page should display a message like "No new notifications 🎉" instead of a list. |

---

### Test Case 5: Dark Mode Rendering

| Test Case ID | TC_NOTIFICATION_05                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. View the page with dark mode enabled. |
| **Expected Result** | All elements, including the background, text, and notification items (in both read and unread states), should have colors consistent with the dark theme. |
