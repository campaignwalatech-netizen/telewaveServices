
# Manual Test Plan for User Query Form

## Objective
To ensure the User Query Form functions correctly, including form submission, validation, and user feedback.

## Test Cases

### 1. Form Rendering
-   **Steps:**
    1.  Navigate to the User Query Form page.
-   **Expected Result:**
    -   The form should be displayed with the title "Submit Your Query".
    -   Input fields for "Full Name", "Email", "Subject", and "Message" should be visible.
    -   A "Submit Query" button should be present.
    -   A "← Back" button should be visible.

### 2. Form Submission (Happy Path)
-   **Steps:**
    1.  Fill in all required fields (Full Name, Email, Message) with valid data.
    2.  Optionally, fill in the "Subject" field.
    3.  Click the "Submit Query" button.
-   **Expected Result:**
    -   A success message "Thank you for your query! We’ll get back to you soon." should be displayed.
    -   An alert with the message "Your query has been submitted successfully!" should appear after a short delay.
    -   The form fields should be cleared after successful submission.

### 3. Form Validation (Error Path)
-   **Steps:**
    1.  Leave one or more of the required fields (Full Name, Email, Message) empty.
    2.  Click the "Submit Query" button.
-   **Expected Result:**
    -   An error message "Please fill in all required fields." should be displayed.
    -   The form should not be submitted.

### 4. Back Button Functionality
-   **Steps:**
    1.  Click the "← Back" button.
-   **Expected Result:**
    -   The user should be navigated to the previous page.

### 5. Dark Mode Rendering
-   **Steps:**
    1.  Enable dark mode in the application.
    2.  Navigate to the User Query Form page.
-   **Expected Result:**
    -   The form and its elements should be rendered with the dark mode color scheme.
