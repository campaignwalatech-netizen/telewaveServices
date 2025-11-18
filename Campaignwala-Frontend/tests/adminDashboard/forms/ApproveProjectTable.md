
# Test Cases for ApproveOffersTable Component

**Component:** `src/adminDashboard/forms/ApproveProjectTable.jsx`

---

### 1. Basic Rendering and Data Fetching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APT-001 | It should render the main title and description. | 1. Render the `ApproveOffersTable` component. | The title "Account Approval Center" and its description should be visible. |
| APT-002 | It should render the file upload section. | 1. Render the component. | A section for uploading Excel/CSV files should be visible. |
| APT-003 | It should display a loading state while fetching offers. | 1. Render the component. <br> 2. Mock the `getAllOffers` service to have a delay. | A loading spinner should be visible in the table section. |
| APT-004 | It should fetch and display a table of offers. | 1. Mock a successful response from `getAllOffers`. <br> 2. Render the component. | A table of offers should be displayed. |
| APT-005 | It should display an error message if fetching offers fails. | 1. Mock a failed response from `getAllOffers`. <br> 2. Render the component. | An error message should be displayed in the table section. |

---

### 2. File Upload Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APT-006 | It should allow selecting a file via the upload zone. | 1. Click on the file upload area. | A file selection dialog should open. |
| APT-007 | It should show an uploading state. | 1. Select a valid file for upload. | The upload area should display a loading spinner and the text "Processing Upload". |
| APT-008 | It should show a success state after simulated upload. | 1. Select a valid file. | After a delay, the upload area should show a "Upload Successful!" message with the file name and size. |
| APT-009 | It should show an error for invalid file types. | 1. Try to upload a non-CSV/Excel file (e.g., `.txt`). | An alert should appear with a message about invalid file type. |
| APT-010 | It should allow removing an uploaded file. | 1. Successfully upload a file. <br> 2. Click the "Upload Different File" button. | The upload area should reset to its initial state. |

---

### 3. Offer Approval Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APT-011 | It should toggle the approval status of an offer. | 1. Render with a list of offers. <br> 2. Click the approval toggle switch for a pending offer. | The `approveOffer` service should be called. The UI should update to show the offer as "Approved". |
| APT-012 | It should show a processing state on the toggle. | 1. Click an approval toggle. <br> 2. Mock the API call to have a delay. | The specific toggle switch that was clicked should be in a disabled/processing state. |
| APT-013 | It should call `rejectOffer` when un-approving an offer. | 1. Click the approval toggle for an already approved offer. | The `rejectOffer` service should be called. |
| APT-014 | It should show an alert on failure to update status. | 1. Mock the `approveOffer` or `rejectOffer` service to fail. <br> 2. Click a toggle. | An alert with an error message should be displayed. |

---

### 4. Other Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| APT-015 | The "Export to CSV" button should trigger a download. | 1. Render with a list of offers. <br> 2. Click the "Export to CSV" button. | A CSV file containing the offer data should be downloaded. |
| APT-016 | The bulk approve toggle should show an alert. | 1. Render the component. <br> 2. Click the "Bulk Approve/Unapprove" toggle. | An alert should appear, informing the user that this feature requires backend support. |

---
