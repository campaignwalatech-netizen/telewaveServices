# Manual Test Cases for ApprovedLeads

**Component:** `src/userDashboard/layouts/ApprovedLeads.jsx`

**Objective:** To verify the display, filtering, and navigation functionality of the approved leads page.

---

### Test Case 1: Render the Approved Leads Page

| Test Case ID | TC_APPROVEDLEADS_01                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page renders correctly with its default elements. |
| **Steps**      | 1. Navigate to the `/user/approved-leads` page. |
| **Expected Result** | The page should display:<br>- The title "Approved Leads".<br>- A category filter dropdown.<br>- A search input field.<br>- Tabs for "Pending", "Approved", and "Rejected" leads, with "Approved" being active.<br>- A table showing the list of approved leads with columns like "Lead ID", "Name", "Category", etc. |

---

### Test Case 2: Tab Navigation

| Test Case ID | TC_APPROVEDLEADS_02                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the tabs navigate to the correct lead pages. |
| **Steps**      | 1. On the approved leads page, click the "Pending" tab.<br>2. Go back. Click the "Rejected" tab. |
| **Expected Result** | - Clicking the "Pending" tab should navigate the user to `/user/pending-leads`.<br>- Clicking the "Rejected" tab should navigate the user to `/user/rejected-leads`. |

---

### Test Case 3: Category Filter

| Test Case ID | TC_APPROVEDLEADS_03                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the leads can be filtered by category. |
| **Steps**      | 1. Select a specific category from the dropdown (e.g., "HDFC Bank").<br>2. Observe the table. |
| **Expected Result** | The table should update to show only the leads that belong to the selected category. In this case, only the lead for "Michael Brown" should be visible. |

---

### Test Case 4: Search Filter

| Test Case ID | TC_APPROVEDLEADS_04                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the leads can be filtered by a search query. |
| **Steps**      | 1. Type a name into the search input (e.g., "Emily").<br>2. Observe the table.<br>3. Clear the search and type an offer name (e.g., "SBI").<br>4. Observe the table. |
| **Expected Result** | - When searching for "Emily", only the lead for "Emily Davis" should be visible.<br>- When searching for "SBI", only the lead for "David Wilson" should be visible. |

---

### Test Case 5: Combined Filtering

| Test Case ID | TC_APPROVEDLEADS_05                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that category and search filters can be used together. |
| **Steps**      | 1. Select "ICICI Bank" from the category filter.<br>2. Type "Emily" into the search input. |
| **Expected Result** | The table should correctly show the single lead for "Emily Davis". |

---

### Test Case 6: No Results Found

| Test Case ID | TC_APPROVEDLEADS_06                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a "no results" message is shown when filters yield no matches. |
| **Steps**      | 1. Type "nonexistent" into the search input. |
| **Expected Result** | The table body should display a message like "No approved leads found." |

---

### Test Case 7: Dark Mode Rendering

| Test Case ID | TC_APPROVEDLEADS_07                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. View the page with dark mode enabled. |
| **Expected Result** | All elements, including the background, text, filters, tabs, and table, should have colors consistent with the dark theme. |
