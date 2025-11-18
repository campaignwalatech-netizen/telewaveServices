# Manual Test Cases for ForgotPasswordPage

**Component:** `ForgotPasswordPage.jsx`

**Objective:** To verify the functionality of the password reset flow, including OTP request, password update, and success confirmation.

---

### Test Case 1: Render Initial Forgot Password Page

| Test Case ID | TC_FORGOT_01                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the initial "Forgot Password" page renders correctly. |
| **Steps**      | 1. Navigate to the forgot password page (`/forgot-password`).<br>2. Observe the rendered components. |
| **Expected Result** | The page should display:<br>- A "Phone Number" input field.<br>- A "SEND RESET OTP" button.<br>- A "Back to Login" link/button. |

---

### Test Case 2: Request OTP - Valid Phone Number

| Test Case ID | TC_FORGOT_02                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user can request a password reset OTP with a valid phone number. |
| **Steps**      | 1. Navigate to `/forgot-password`.<br>2. Enter a valid, registered 10-digit phone number.<br>3. Click the "SEND RESET OTP" button. |
| **Expected Result** | The user should be advanced to the OTP and new password step.<br>An informational message about the sent OTP may be visible. |

---

### Test Case 3: Request OTP - Invalid or Unregistered Phone Number

| Test Case ID | TC_FORGOT_03                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an error is shown for an invalid or unregistered phone number. |
| **Steps**      | 1. Navigate to `/forgot-password`.<br>2. Enter an invalid phone number (e.g., "123") or an unregistered one.<br>3. Click the "SEND RESET OTP" button. |
| **Expected Result** | An appropriate error message (e.g., "Please enter a valid 10-digit phone number" or "User not found") should be displayed.<br>The user should remain on the initial step. |

---

### Test Case 4: Reset Password - Valid Data

| Test Case ID | TC_FORGOT_04                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the user can reset their password with a valid OTP and new password. |
| **Prerequisites** | The user is on the OTP/new password step. |
| **Steps**      | 1. Enter the correct 4-digit OTP.<br>2. Enter a new password in the "New Password" field.<br>3. Re-enter the same password in the "Confirm Password" field.<br>4. Click the "RESET PASSWORD" button. |
| **Expected Result** | The user should be shown a success message.<br>A link to the login page should be visible. |

---

### Test Case 5: Reset Password - Invalid OTP

| Test Case ID | TC_FORGOT_05                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an error is shown for an invalid OTP. |
| **Prerequisites** | The user is on the OTP/new password step. |
| **Steps**      | 1. Enter an incorrect 4-digit OTP.<br>2. Fill in the password fields.<br>3. Click the "RESET PASSWORD" button. |
| **Expected Result** | An error message (e.g., "Invalid OTP") should be displayed.<br>The user should remain on the same step. |

---

### Test Case 6: Reset Password - Password Mismatch

| Test Case ID | TC_FORGOT_06                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an error is shown if the new passwords do not match. |
| **Prerequisites** | The user is on the OTP/new password step. |
| **Steps**      | 1. Enter a valid OTP.<br>2. Enter a new password.<br>3. Enter a different password in the "Confirm Password" field.<br>4. Click the "RESET PASSWORD" button. |
| **Expected Result** | An error message (e.g., "Passwords do not match") should be displayed. |

---

### Test Case 7: Reset Password - Invalid Password (Too Short)

| Test Case ID | TC_FORGOT_07                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify validation for a password that is too short. |
| **Prerequisites** | The user is on the OTP/new password step. |
| **Steps**      | 1. Enter a valid OTP.<br>2. Enter a password shorter than 6 characters.<br>3. Confirm the short password.<br>4. Click the "RESET PASSWORD" button. |
| **Expected Result** | An error message (e.g., "Password must be at least 6 characters") should be displayed. |

---

### Test Case 8: Success Page Navigation

| Test Case ID | TC_FORGOT_08                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the user can navigate to the login page from the success screen. |
| **Prerequisites** | The user has successfully reset their password. |
| **Steps**      | 1. On the success screen, click the "Go to Login" button. |
| **Expected Result** | The user should be redirected to the login page (`/login`). |

---

### Test Case 9: Back to Login Navigation

| Test Case ID | TC_FORGOT_09                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Back to Login" link works correctly. |
| **Steps**      | 1. Navigate to `/forgot-password`.<br>2. Click the "Back to Login" link/button. |
| **Expected Result** | The user should be redirected to the login page (`/login`). |
