# Manual Test Cases for OtpVerification

**Component:** `OtpVerification.jsx`

**Objective:** To verify the functionality of the OTP verification screen, including input handling, validation, and redirection upon successful verification.

---

### Test Case 1: Render the OTP Verification Page

| Test Case ID | TC_OTP_01                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the OTP verification page renders correctly. |
| **Prerequisites** | The user is redirected to this page from another flow (e.g., registration) with `phone` and `userType` in the location state. |
| **Steps**      | 1. Navigate to the OTP verification page.<br>2. Observe the rendered components. |
| **Expected Result** | The page should display:<br>- A series of input fields for the OTP (6 digits).<br>- The phone number to which the OTP was sent.<br>- A "Verify & Continue" button.<br>- A "Resend Code" button or a timer. |

---

### Test Case 2: Successful OTP Verification

| Test Case ID | TC_OTP_02                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user can verify a valid OTP and is redirected. |
| **Prerequisites** | The user is on the OTP verification page. |
| **Steps**      | 1. Enter the correct 6-digit OTP in the input fields.<br>2. Click the "Verify & Continue" button. |
| **Expected Result** | The user's login state is saved to `localStorage`.<br>The user is redirected to their dashboard (`/admin` or `/user`) based on the `userType` passed in the state. |

---

### Test Case 3: Failed OTP Verification - Invalid Code

| Test Case ID | TC_OTP_03                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an error message is shown for an invalid OTP. |
| **Steps**      | 1. Enter an incorrect 6-digit OTP.<br>2. Click the "Verify & Continue" button. |
| **Expected Result** | An error message (e.g., "Please enter complete OTP") is displayed.<br>The user remains on the OTP page. |

---

### Test Case 4: Input Handling - Auto-focus

| Test Case ID | TC_OTP_04                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that focus automatically moves to the next input field. |
| **Steps**      | 1. Enter a digit in the first OTP input field.<br>2. Enter a digit in the second, and so on. |
| **Expected Result** | After entering a digit, the focus should automatically move to the next input field in the sequence. |

---

### Test Case 5: Input Handling - Backspace

| Test Case ID | TC_OTP_05                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that using the backspace key works as expected. |
| **Steps**      | 1. Fill in a few OTP digits.<br>2. Press the backspace key in an empty input field. |
| **Expected Result** | The focus should move to the previous input field. |

---

### Test Case 6: Input Handling - Paste

| Test Case ID | TC_OTP_06                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user can paste an OTP code into the fields. |
| **Steps**      | 1. Copy a 6-digit code to the clipboard.<br>2. Paste it into one of the OTP input fields. |
| **Expected Result** | The pasted code should correctly fill the OTP input fields. |

---

### Test Case 7: Resend OTP Timer and Button

| Test Case ID | TC_OTP_07                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify the functionality of the resend OTP timer and button. |
| **Steps**      | 1. Observe the resend timer counting down.<br>2. Wait for the timer to reach zero.<br>3. Observe that the timer is replaced by a "Resend Code" button.<br>4. Click the "Resend Code" button. |
| **Expected Result** | The OTP input fields should be cleared, and the resend timer should start again from 30 seconds. |

---

### Test Case 8: Navigation without State

| Test Case ID | TC_OTP_08                                          |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the user is redirected if they access the page directly without the required state. |
| **Steps**      | 1. Directly navigate to the `/otp-verification` URL in the browser. |
| **Expected Result** | The user should be redirected to the login page (`/`). |
