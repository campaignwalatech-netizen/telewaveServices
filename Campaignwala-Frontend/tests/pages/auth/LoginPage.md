# Manual Test Cases for LoginPage

**Component:** `LoginPage.jsx`

**Objective:** To verify the functionality of the login page, including user input, form submission, validation, and navigation.

---

### Test Case 1: Render the Login Page

| Test Case ID | TC_LOGIN_01                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the login page renders correctly with all UI elements. |
| **Steps**      | 1. Navigate to the login page (`/`).<br>2. Observe the rendered components. |
| **Expected Result** | The page should display:<br>- A "Phone Number" input field.<br>- A "Password" input field.<br>- A "Show/Hide Password" button.<br>- A "Forgot Password?" link.<br>- A "LOGIN" button.<br>- A "Register" link. |

---

### Test Case 2: Successful Login

| Test Case ID | TC_LOGIN_02                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a user can log in with valid credentials. |
| **Prerequisites** | A valid user account exists. |
| **Steps**      | 1. Navigate to the login page.<br>2. Enter a valid phone number in the "Phone Number" field.<br>3. Enter the correct password in the "Password" field.<br>4. Click the "LOGIN" button. |
| **Expected Result** | The user is redirected to their dashboard (`/admin` or `/user`). |

---

### Test Case 3: Failed Login - Invalid Credentials

| Test Case ID | TC_LOGIN_03                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that an error message is shown for invalid credentials. |
| **Steps**      | 1. Navigate to the login page.<br>2. Enter a valid phone number.<br>3. Enter an incorrect password.<br>4. Click the "LOGIN" button. |
| **Expected Result** | An error message (e.g., "Invalid credentials") is displayed on the page.<br>The user remains on the login page. |

---

### Test Case 4: Form Validation - Empty Fields

| Test Case ID | TC_LOGIN_04                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the form shows validation errors for empty required fields. |
| **Steps**      | 1. Navigate to the login page.<br>2. Leave the "Phone Number" and "Password" fields empty.<br>3. Click the "LOGIN" button. |
| **Expected Result** | The browser's default HTML5 validation message for required fields should appear. The form should not be submitted. |

---

### Test Case 5: Form Validation - Invalid Phone Number

| Test Case ID | TC_LOGIN_05                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify validation for an invalid phone number format. |
| **Steps**      | 1. Navigate to the login page.<br>2. Enter a phone number with less than 10 digits (e.g., "12345").<br>3. Enter a password.<br>4. Click the "LOGIN" button. |
| **Expected Result** | The browser's HTML5 validation for the `pattern` attribute should prevent submission. |

---

### Test Case 6: Show/Hide Password

| Test Case ID | TC_LOGIN_06                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify the functionality of the show/hide password button. |
| **Steps**      | 1. Navigate to the login page.<br>2. Enter text into the "Password" field.<br>3. Observe that the text is masked.<br>4. Click the "Show Password" (eye) icon.<br>5. Observe the password field.<br>6. Click the "Hide Password" (eye-off) icon. |
| **Expected Result** | The entered password text should become visible when the "Show Password" icon is clicked, and masked again when the "Hide Password" icon is clicked. |

---

### Test Case 7: Loading State

| Test Case ID | TC_LOGIN_07                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "LOGIN" button is disabled during form submission. |
| **Steps**      | 1. Navigate to the login page.<br>2. Enter valid credentials.<br>3. Click the "LOGIN" button.<br>4. Immediately try to click the button again. |
| **Expected Result** | The "LOGIN" button should be disabled and display a loading indicator (e.g., "LOGGING IN..."). |

---

### Test Case 8: Navigation Links

| Test Case ID | TC_LOGIN_08                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Forgot Password?" and "Register" links navigate to the correct pages. |
| **Steps**      | 1. Navigate to the login page.<br>2. Click the "Forgot Password?" link.<br>3. Verify navigation.<br>4. Go back to the login page.<br>5. Click the "Register" link.<br>6. Verify navigation. |
| **Expected Result** | Clicking "Forgot Password?" navigates to `/forgot-password`.<br>Clicking "Register" navigates to `/register`. |
