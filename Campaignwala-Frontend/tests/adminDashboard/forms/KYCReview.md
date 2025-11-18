
# Test Cases for KYCReview Component

**Component:** `src/adminDashboard/forms/KYCReview.jsx`

---

### 1. Table View

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| KYC-001 | It should render the table of pending KYC applications. | 1. Render the `KYCReview` component. | The component should display the title "KYC Review - Pending Applications" and a table with user data. |
| KYC-002 | It should filter the table based on the search term. | 1. Render the component. <br> 2. Type a user's name (e.g., "Priya Patel") into the search bar. | The table should update to show only the row(s) matching the search term. |
| KYC-003 | It should show a message if no users match the search. | 1. Type a non-existent name into the search bar. | The table should be empty, and a message "No KYC applications found matching your search" should appear. |
| KYC-004 | It should switch to the details view when "View Details" is clicked. | 1. Click the "View Details" button on any user row. | The view should change to show the detailed information for that specific user. |

---

### 2. Details View

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| KYC-005 | It should display the correct user's full details. | 1. Navigate to the details view for a specific user. | All sections (User Details, PAN Card, Bank Account) should be populated with the correct data for the selected user. The title should update to "KYC Review - [User Name]". |
| KYC-006 | The "Back to List" button should return to the table view. | 1. In the details view, click the "Back to List" button. | The component should switch back to the table view of all pending applications. |
| KYC-007 | The back arrow button should return to the table view. | 1. In the details view, click the arrow button in the header. | The component should switch back to the table view. |

---

### 3. Actions (Approve/Reject)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| KYC-008 | It should show an alert on "Approve KYC" click. | 1. In the details view, click the "Approve KYC" button. | An alert `KYC approved for [User Name]` should appear, and the view should return to the table. |
| KYC-009 | It should prompt for a reason on "Reject KYC" click. | 1. In the details view, click the "Reject KYC" button. | A `prompt` dialog should appear asking for a rejection reason. |
| KYC-010 | It should show an alert after a reason is provided for rejection. | 1. Click "Reject KYC". <br> 2. Enter a reason in the prompt and click OK. | An alert `KYC rejected for [User Name]` should appear, and the view should return to the table. |
| KYC-011 | It should do nothing if the rejection prompt is canceled. | 1. Click "Reject KYC". <br> 2. Click "Cancel" in the prompt dialog. | No alert should be shown, and the view should remain on the user details page. |

---
