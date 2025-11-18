
# Test Cases for AdminLogsTable Component

**Component:** `src/adminDashboard/forms/AdminLogsTable.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ALT-001 | It should render the table with a title and logs. | 1. Render the `AdminLogsTable` component. | The component should display the title "Admin Activity Logs", an "Export Logs" button, and a table containing log data. |
| ALT-002 | It should render the correct number of log entries. | 1. Render the component. | The table body should contain the same number of rows as the `logs` data array. |
| ALT-003 | The details modal should be hidden by default. | 1. Render the component. | The log details modal should not be visible in the DOM. |

---

### 2. Data Display and Styling

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ALT-004 | It should display the correct data in each row. | 1. Render the component and inspect the first row. | The first row should correspond to the first item in the `logs` array, showing the correct ID, Admin, Action, etc. |
| ALT-005 | It should apply the correct color style for each severity level. | 1. Render the component. <br> 2. Inspect the "Severity" cell for different log entries. | The severity badge should have the correct background and text color based on its level (e.g., blue for info, green for success, red for error). |

---

### 3. Modal Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ALT-006 | It should open the details modal when "View Details" is clicked. | 1. Render the component. <br> 2. Click the "View Details" button on any log row. | The details modal should appear. |
| ALT-007 | The modal should display the correct details for the selected log. | 1. Click "View Details" for a specific log. | The modal should be populated with all the information from that log object, including ID, Admin, Action, and the detailed description. |
| ALT-008 | It should close the modal when the `X` button is clicked. | 1. Open the details modal. <br> 2. Click the `X` button in the modal's header. | The modal should disappear. |
| ALT-009 | It should close the modal when the "Close" button is clicked. | 1. Open the details modal. <br> 2. Click the "Close" button in the modal's footer. | The modal should disappear. |

---

### 4. Other Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ALT-010 | The "Export Logs" button should be clickable. | 1. Render the component. <br> 2. Click the "Export Logs" button. | The button should be interactive. (No specific functionality is implemented in the code). |

---
