
# Manual Test Cases for AllLeads Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **AL-1** | **Verify component rendering** | 1. Navigate to the "All Leads" page. | The `AllLeads` component should render with the title "All Leads" and a table of leads. | |
| **AL-2** | **Verify category filter** | 1. Select a category from the dropdown (e.g., "DEMAT Account"). | The table should update to show only leads from the selected category. | |
| **AL-3** | **Verify search functionality** | 1. Enter a name or contact number in the search bar. | The table should display only the leads that match the search query. | |
| **AL-4** | **Verify tab navigation** | 1. Click on the "Pending", "Approved", or "Rejected" tabs. | The user should be navigated to the respective page for that lead status. | |
| **AL-5** | **Verify empty state** | 1. Filter or search for leads that don't exist. | The table should display a "No leads found." message. | |
| **AL-6** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme with appropriate colors. | |
| **AL-7** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme with appropriate colors. | |
| **AL-8** | **Verify responsive table** | 1. View the page on different screen sizes. | The table columns should adjust responsively. Some columns might be hidden on smaller screens. | |
