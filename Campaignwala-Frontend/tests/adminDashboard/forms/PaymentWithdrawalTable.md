
# Test Cases for PaymentWithdrawalTable Component

**Component:** `src/adminDashboard/forms/PaymentWithdrawalTable.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PWT-001 | It should render the main title and statistics cards. | 1. Render the `PaymentWithdrawalTable` component. | The title "Payment Withdrawal Requests" and statistics cards (Total, Approved, Pending, Denied) should be visible. |
| PWT-002 | It should render the table with withdrawal requests. | 1. Render the component. | A table should be displayed with rows of withdrawal data. |
| PWT-003 | It should calculate and display the correct statistics. | 1. Render the component with the initial mock data. | The stats cards should show the correct counts: Total (25), Approved (10), Pending (6), and Denied (4). |

---

### 2. Filtering and Searching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PWT-004 | It should filter the table by search term. | 1. Render the component. <br> 2. Type a lead name (e.g., "Bob Williams") into the search bar. | The table should update to show only the row(s) matching the search term. |
| PWT-005 | It should filter the table by status. | 1. Render the component. <br> 2. Select "Pending" from the status filter dropdown. | The table should update to show only withdrawal requests with the status "Pending". |

---

### 3. View Details Modal

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PWT-006 | It should open the details modal when "View Details" is clicked. | 1. Click the "View Details" button on a row. | The modal should appear with the title "Withdrawal Details" and show all information for that request, including bank details. |
| PWT-007 | The details modal should close when the `X` button is clicked. | 1. Open the details modal. <br> 2. Click the `X` button. | The modal should disappear. |
| PWT-008 | It should show the approve/reject action forms within the modal. | 1. Open the details modal. <br> 2. Click the "Approve" button. | The form for entering a Transaction ID should appear. |
| P
WT-009 | It should show the reject form when "Reject" is clicked in the modal. | 1. Open the details modal. <br> 2. Click the "Reject" button. | The form for entering a Rejection Reason should appear. |

---

### 4. Approve/Reject Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PWT-010 | It should show an alert if Transaction ID is missing on approval. | 1. Open the details modal and click "Approve". <br> 2. Click "Confirm Approval" without entering a Transaction ID. | An alert "Please enter transaction ID" should appear. |
| PWT-011 | It should update the status to "Approved" on successful approval. | 1. Open the modal for a pending request, click "Approve". <br> 2. Enter a Transaction ID and click "Confirm Approval". | The modal should close, and the status of the corresponding row in the table should change to "Approved". The details should be updated with the transaction ID. |
| PWT-012 | It should show an alert if Rejection Reason is missing. | 1. Open the modal and click "Reject". <br> 2. Click "Confirm Rejection" without entering a reason. | An alert "Please enter rejection reason" should appear. |
| PWT-013 | It should update the status to "Rejected" on successful rejection. | 1. Open the modal for a pending request, click "Reject". <br> 2. Enter a reason and click "Confirm Rejection". | The modal should close, and the status of the row should change to "Rejected". The details should be updated with the reason. |

---

### 5. Legacy Action Modal (Deprecated but present)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PWT-014 | It should open the simple confirmation modal. | 1. This functionality seems to be tied to `handleAction`, which is not used in the UI. This test case is for completeness if the function were to be used. | A simple confirmation modal should appear. |

---
