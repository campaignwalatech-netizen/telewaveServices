# Manual Test Cases for PendingLeads

**Component:** `src/userDashboard/layouts/PendingLeads.jsx`

**Objective:** To verify the display, filtering, and navigation functionality of the pending leads page.

---

### Test Case 1: Render the Pending Leads Page

| Test Case ID | TC_PENDINGLEADS_01                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page renders correctly with its default elements. |
| **Steps**      | 1. Navigate to the `/user/pending-leads` page. |
| **Expected Result** | The page should display:<br>- The title "Pending Leads".<br>- A category filter dropdown.<br>- A search input field.<br>- Tabs for "Pending", "Approved", and "Rejected" leads, with "Pending" being active.<br>- A table showing the list of pending leads with columns like "Lead ID", "Name", "Status", etc. |

---

### Test Case 2: Tab Navigation

| Test Case ID | TC_PENDINGLEADS_02                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the tabs navigate to the correct lead pages. |
| **Steps**      | 1. On the pending leads page, click the "Approved" tab.<br>2. Go back. Click the "Rejected" tab. |
| **Expected Result** | - Clicking the "Approved" tab should navigate the user to `/user/approved-leads`.<br>- Clicking the "Rejected" tab should navigate the user to `/user/rejected-leads`. |

---

### Test Case 3: Category Filter

| Test Case ID | TC_PENDINGLEADS_03                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the leads can be filtered by category. |
| **Steps**      | 1. Select a specific category from the dropdown (e.g., "ICICI Bank").<br>2. Observe the table. |
| **Expected Result** | The table should update to show only the leads that belong to the selected category. In this case, only the lead for "Rahul Kumar" should be visible. |

---

### Test Case 4: Search Filter

| Test Case ID | TC_PENDINGLEADS_04                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the leads can be filtered by a search query. |
| **Steps**      | 1. Type a name into the search input (e.g., "Sneha").<br>2. Observe the table. |
| **Expected Result** | When searching for "Sneha", only the lead for "Sneha Gupta" should be visible. |

---

### Test Case 5: No Results Found

| Test Case ID | TC_PENDINGLEADS_05                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a "no results" message is shown when filters yield no matches. |
| **Steps**      | 1. Type "nonexistent" into the search input. |
| **Expected Result** | The table body should display a message like "No leads found." |

---

### Test Case 6: Dark Mode Rendering

| Test Case ID | TC_PENDINGLEADS_06                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. View the page with dark mode enabled. |
| **Expected Result** | All elements, including the background, text, filters, tabs, and table, should have colors consistent with the dark theme. |
