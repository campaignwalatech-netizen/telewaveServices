
# Test Cases for ResetPasswordForm Component

**Component:** `src/adminDashboard/forms/ResetPasswordForm.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| RPF-001 | It should render the form with all fields. | 1. Render the `ResetPasswordForm` component. | The form should display the title "Reset User Password" and input fields for Phone Number, New Password, Confirm Password, and OTP. A warning message should also be visible. |

---

### 2. Form Validation and Interaction

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| RPF-002 | It should update the form state on input change. | 1. Render the component. <br> 2. Type a phone number into the "Phone Number" input. | The component's state for `formData.phoneNumber` should be updated. |
| RPF-003 | It should show an alert if passwords do not match on submit. | 1. Enter a value for "New Password" and a different value for "Confirm Password". <br> 2. Click "Reset Password". | An alert with the message "Passwords do not match!" should appear. The form should not be submitted. |
| RPF-004 | It should show an alert for an invalid OTP format. | 1. Fill the form with matching passwords. <br> 2. Enter an OTP that is not 6 digits (e.g., "12345"). <br> 3. Click "Reset Password". | An alert with the message "Please enter a valid 6-digit OTP!" should appear. |

---

### 3. Form Submission

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| RPF-005 | It should show a success alert on successful submission. | 1. Fill all form fields with valid and matching data. <br> 2. Click "Reset Password". | An alert with the message "Password reset successfully!" should appear. The form data should be logged to the console. |
| RPF-006 | The "Cancel" button should be present. | 1. Render the component. | A "Cancel" button should be visible. (Note: No `onClick` handler is attached to it in the provided code). |

---
