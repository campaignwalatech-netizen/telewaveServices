# Manual Test Cases for RejectedLeads Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **RL-1** | **Verify component rendering** | 1. Navigate to the rejected leads page. | The `RejectedLeads` component should render with the title "Rejected Leads". | |
| **RL-2** | **Verify table rendering** | 1. Observe the leads table. | The table should display a list of rejected leads with columns: Lead ID, Name, Category, Offer, Created Date, Rejected Date, and Reason. | |
| **RL-3** | **Verify category filter** | 1. Select a category from the dropdown (e.g., "Axis Bank"). | The table should only show leads belonging to the selected category. | |
| **RL-4** | **Verify search functionality** | 1. Type a search query in the search bar (e.g., "John Doe"). | The table should only display leads that match the search query. | |
| **RL-5** | **Verify tab navigation** | 1. Click on the "Pending" or "Approved" tabs. | The user should be navigated to the corresponding page (`/user/pending-leads` or `/user/approved-leads`). | |
| **RL-6** | **Verify empty state** | 1. Filter or search for a lead that does not exist. | The table should display a message "No rejected leads found." | |
| **RL-7** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme with appropriate colors. | |
| **RL-8** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme with appropriate colors. | |
| **RL-9** | **Verify responsive view** | 1. Open the page on a mobile device or resize the browser window to a smaller width. | The table should be replaced with a card-based layout for better mobile viewing. | |