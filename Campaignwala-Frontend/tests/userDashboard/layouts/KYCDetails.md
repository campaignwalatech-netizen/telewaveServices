# Manual Test Cases for KYCDetails

**Component:** `src/userDashboard/layouts/KYCDetails.jsx`

**Objective:** To verify the display, editability, and state management of the KYC and user details form.

---

### Test Case 1: Render the KYC Details Page

| Test Case ID | TC_KYC_01                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page renders correctly with all sections in a read-only state. |
| **Steps**      | 1. Navigate to the `/user/kyc-details` page. |
| **Expected Result** | The page should display:<br>- A title "KYC/Personal Details".<br>- A KYC verification status indicator.<br>- Three sections: "Personal Details", "KYC Documents", and "Bank Details".<br>- All input fields within these sections should be disabled/read-only.<br>- Each section should have an "Edit" button. |

---

### Test Case 2: Enable Editing for a Section

| Test Case ID | TC_KYC_02                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that clicking the "Edit" button makes a section's fields editable. |
| **Steps**      | 1. Click the "Edit" button for the "Personal Details" section.<br>2. Observe the fields in that section. |
| **Expected Result** | - The input fields within the "Personal Details" section should become editable.<br>- The fields in the other sections ("KYC Documents", "Bank Details") should remain disabled.<br>- The "Edit" button for the personal details section should change to a "Save" button. |

---

### Test Case 3: Edit and Save a Section

| Test Case ID | TC_KYC_03                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that changes can be made to a field and the section can be returned to a read-only state. |
| **Steps**      | 1. Click "Edit" for the "Personal Details" section.<br>2. Change the value in the "First Name" field.<br>3. Click the "Save" button for that section. |
| **Expected Result** | - The fields in the "Personal Details" section should become read-only again.<br>- The new value for "First Name" should be retained in the input field.<br>- The "Save" button should revert to an "Edit" button. |

---

### Test Case 4: Independent Section Editing

| Test Case ID | TC_KYC_04                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that editing one section does not affect the state of another. |
| **Steps**      | 1. Click "Edit" for the "Personal Details" section.<br>2. Click "Edit" for the "Bank Details" section. |
| **Expected Result** | Both the "Personal Details" and "Bank Details" sections should become editable, while the "KYC Documents" section remains disabled. |

---

### Test Case 5: Form Input

| Test Case ID | TC_KYC_05                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that data can be entered into the form fields when editable. |
| **Steps**      | 1. Make a section editable.<br>2. Type into various text inputs, select from dropdowns, and enter a date. |
| **Expected Result** | The component's state should update to reflect the new values entered by the user. |

---

### Test Case 6: Dark Mode Rendering

| Test Case ID | TC_KYC_06                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the form and all its elements display correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. View the page with dark mode enabled.<br>2. Toggle the edit state for a section. |
| **Expected Result** | All elements, including backgrounds, text, inputs (in both read-only and editable states), and buttons, should have colors consistent with the dark theme. |
