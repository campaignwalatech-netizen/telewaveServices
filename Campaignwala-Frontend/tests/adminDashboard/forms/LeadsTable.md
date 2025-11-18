
# Test Cases for LeadsTable Component

**Component:** `src/adminDashboard/forms/LeadsTable.jsx`

---

### 1. Basic Rendering and Data Fetching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| LT-001 | It should render the table with a dynamic title based on the `status` prop. | 1. Render the `LeadsTable` component with `status="pending"`. | The title "Pending Leads" should be visible. |
| LT-002 | It should display a loading state while fetching leads. | 1. Render the component. <br> 2. Mock the `leadService.getAllLeads` to have a delay. | A loading state should be visible in the table body. |
| LT-003 | It should fetch and display a table of leads. | 1. Mock a successful response from `getAllLeads`. <br> 2. Render the component. | A table of leads should be displayed with correct data. |
| LT-004 | It should display a message if no leads are found. | 1. Mock a successful response with an empty array of leads. <br> 2. Render the component. | A message "No [status] leads found" should be displayed in the table. |
| LT-005 | It should fetch and display lead statistics. | 1. Mock a successful response from `leadService.getLeadStats`. <br> 2. Render the component. | The statistics for pending, approved, etc., should be displayed (although they are not explicitly rendered in the provided JSX, the fetch call is made). |

---

### 2. Filtering and Searching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| LT-006 | It should filter leads by search term. | 1. Render with a list of leads. <br> 2. Type a search term into the search input. | The `fetchLeads` function should be called with the search term, and the table should update. |
| LT-007 | It should filter leads by campaign. | 1. Render with leads from different campaigns. <br> 2. Select a campaign from the filter dropdown. | The table should update to show only leads from the selected campaign. |

---

### 3. Lead Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| LT-008 | It should open the view modal when "View" is clicked. | 1. Render the component. <br> 2. Click the "View" button on a lead row. | The modal should appear, displaying the detailed information for that lead. |
| LT-009 | The view modal should close when the `X` button is clicked. | 1. Open the view modal. <br> 2. Click the `X` button. | The modal should disappear. |
| LT-010 | It should allow changing the status of a lead. | 1. Render the component. <br> 2. Change the value in the status dropdown for a lead. | The corresponding `leadService` function (e.g., `approveLead`) should be called. |
| LT-011 | It should prompt for a reason when rejecting a lead. | 1. Change a lead's status to "rejected". <br> 2. Mock the `prompt` function. | The `prompt` function should be called to ask for a rejection reason. |
| LT-012 | It should show an alert on successful status change. | 1. Mock a successful response from the status change API call. <br> 2. Change a lead's status. | An alert with a success message should be displayed. The leads and stats should be re-fetched. |

---

### 4. Other Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| LT-013 | The "Export" button should show an alert. | 1. Render the component. <br> 2. Click the "Export" button. | An alert "Export functionality will be implemented soon!" should appear. |

---
