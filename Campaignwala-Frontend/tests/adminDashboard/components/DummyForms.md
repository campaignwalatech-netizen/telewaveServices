
# Test Cases for DummyForms Components

**Component:** `src/adminDashboard/components/DummyForms.jsx`

---

### 1. DistributeLeadsForm

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DF-DL-001 | It should render the Distribute Leads form correctly. | 1. Render the `DistributeLeadsForm` component. | The form should have a title "Distribute Leads", a select input for team members, a number input for leads, a select input for priority, and a "Distribute" button. |

---

### 2. UploadLeadsForm

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DF-UL-001 | It should render the Upload Leads form correctly. | 1. Render the `UploadLeadsForm` component. | The form should have a title "Upload Fresh Leads", a file input for CSV, a text input for Freelancer name, a textarea for description, and an "Upload Leads" button. |

---

### 3. ApproveAccountForm

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DF-AA-001 | It should render the Approve Account form with pending accounts. | 1. Render the `ApproveAccountForm` component. | The form should have a title "Approve Account" and display a list of user accounts waiting for approval, each with "Approve" and "Reject" buttons. |

---

### 4. AddAccountForm

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DF-NA-001 | It should render the Add New Account form correctly. | 1. Render the `AddAccountForm` component. | The form should have a title "Add New Account" and fields for Full Name, Email, Phone, Role, and Address, along with an "Add Account" button. |

---

### 5. DefaultView

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| DF-DV-001 | It should render the default welcome view. | 1. Render the `DefaultView` component. | The component should display a welcome message: "Welcome to Freelancewala Admin Dashboard" and a prompt to select a menu item. |

---
