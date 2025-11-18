
# Test Cases for ActivityFeed Component

**Component:** `src/adminDashboard/components/ActivityFeed.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AF-001 | It should render the activity feed with a title. | 1. Render the `ActivityFeed` component with an array of activities. | The component should display the title "Recent Activity" and a list of activities. |
| AF-002 | It should display a message or empty state when there are no activities. | 1. Render the component with an empty `activities` array. | The component should render the title, but the list of activities should be empty. No errors should occur. |

---

### 2. Data Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AF-003 | It should display the correct data for each activity. | 1. Render the component with a sample activity object. | The activity should display the user's name, the action they performed, and the time of the activity. |
| AF-004 | It should render the user's initial in the avatar. | 1. Render the component with an activity where the user is "John Doe". | The circular avatar for that activity should display the letter "J". |
| AF-005 | It should render the correct number of activities. | 1. Render the component with an array of 5 activities. | The list should contain exactly 5 activity items. |

---

### 3. Styling and Structure

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AF-006 | The last activity item should not have a bottom border. | 1. Render the component with multiple activities. <br> 2. Inspect the last item in the list. | The last activity `div` should not have the `border-b` class. |

---
