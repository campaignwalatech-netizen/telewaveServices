# Manual Test Scenarios for Register.jsx

## 1. Phone Number Step

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| REG-001 | Submit a valid 10-digit phone number | 1. Enter a valid 10-digit phone number. <br> 2. Click "SEND OTP". | The form should transition to the OTP verification step. A success message should be displayed. |
| REG-002 | Submit an invalid phone number (less than 10 digits) | 1. Enter a 9-digit phone number. <br> 2. Click "SEND OTP". | An error message "Please enter a valid 10-digit phone number" should be displayed. The form should not transition. |
| REG-003 | Submit an invalid phone number (more than 10 digits) | 1. Enter an 11-digit phone number. <br> 2. Click "SEND OTP". | The input should not accept more than 10 digits. |
| REG-004 | Submit a non-numeric phone number | 1. Enter "abcdefghij". <br> 2. Click "SEND OTP". | An error message "Please enter a valid 10-digit phone number" should be displayed. The form should not transition. |
| REG-005 | Submit an empty phone number | 1. Leave the phone number field empty. <br> 2. Click "SEND OTP". | An error message "Please enter a valid 10-digit phone number" should be displayed. The form should not transition. |
| REG-006 | API error when sending OTP | 1. Enter a valid 10-digit phone number. <br> 2. Click "SEND OTP". (Simulate API failure) | An error message "Failed to send OTP" should be displayed. The form should not transition. |

## 2. OTP Verification Step

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| REG-007 | Submit a valid OTP | 1. After entering a valid phone number, enter the correct 4-digit OTP. <br> 2. Click "VERIFY OTP". | The form should transition to the user details step. A success message "OTP verified!" should be displayed. |
| REG-008 | Submit an invalid OTP | 1. After entering a valid phone number, enter an incorrect 4-digit OTP. <br> 2. Click "VERIFY OTP". | An error message "Invalid OTP. Please try again." should be displayed. The form should not transition. |
| REG-009 | Submit an empty OTP | 1. After entering a valid phone number, leave the OTP field empty. <br> 2. Click "VERIFY OTP". | An error message "Please enter the 4-digit OTP" should be displayed. The form should not transition. |
| REG-010 | "Try Again" button functionality | 1. After entering a valid phone number, click the "Try Again" button on the OTP screen. | The form should transition back to the phone number step. The OTP field should be cleared. |

## 3. User Details Step

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| REG-011 | Submit valid user details | 1. After OTP verification, fill in all fields (Full Name, Email, Password) with valid data. <br> 2. Click "COMPLETE REGISTRATION". | The user should be successfully registered and redirected to the dashboard. |
| REG-012 | Submit with missing required fields | 1. After OTP verification, leave one or more fields empty. <br> 2. Click "COMPLETE REGISTRATION". | An error message "All fields are required" should be displayed. Registration should not proceed. |
| REG-013 | Submit with an invalid email format | 1. After OTP verification, enter an invalid email (e.g., "test@test"). <br> 2. Click "COMPLETE REGISTRATION". | An error message "Please enter a valid email address" should be displayed. Registration should not proceed. |
| REG-014 | Submit with a short password | 1. After OTP verification, enter a password with less than 6 characters. <br> 2. Click "COMPLETE REGISTRATION". | An error message "Password must be at least 6 characters long" should be displayed. Registration should not proceed. |
| REG-015 | Password visibility toggle | 1. In the password field, click the "show password" icon. | The password should become visible. Clicking it again should hide the password. |
| REG-016 | API error during registration | 1. After OTP verification, fill in all fields with valid data. <br> 2. Click "COMPLETE REGISTRATION". (Simulate API failure) | An error message "Registration failed. Please try again." should be displayed. |
| REG-017 | "Back to OTP" button functionality | 1. On the user details screen, click the "← Back to OTP" button. | The form should transition back to the OTP verification step. |

## 4. General

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| REG-018 | "Already have an account? Login" link | 1. On any step of the registration form, click the "Login" link. | The user should be redirected to the login page. |