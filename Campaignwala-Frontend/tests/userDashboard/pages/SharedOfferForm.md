
# Manual Test Cases for SharedOfferForm Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **SOF-1** | **Verify component rendering** | 1. Navigate to a shared offer link (e.g., `/share/offer-id/user-id`). | The component should load the offer details and display a form to claim the offer. | |
| **SOF-2** | **Verify loading state** | 1. While the offer details are loading, observe the UI. | A loading spinner should be visible. | |
| **SOF-3** | **Verify error state for invalid offer** | 1. Navigate to a shared offer link with an invalid offer ID. | An error message "Offer not found" should be displayed with a button to go home. | |
| **SOF-4** | **Verify form validation (empty fields)** | 1. Click the "CLAIM NOW" button without filling out the form. | Error messages should appear below the name and phone number fields. | |
| **SOF-5** | **Verify form validation (invalid phone)** | 1. Enter a valid name. 2. Enter an invalid phone number (e.g., less than 10 digits). 3. Click "CLAIM NOW". | An error message for the invalid phone number should be displayed. | |
| **SOF-6** | **Verify successful form submission** | 1. Fill in a valid name and phone number. 2. Click "CLAIM NOW". | A success alert should be shown, and the user should be redirected to the home page. | |
| **SOF-7** | **Verify submitting state** | 1. While the form is submitting, observe the submit button. | The button should be disabled and show a "Submitting..." message with a spinner. | |
| **SOF-8** | **Verify dark mode** | 1. If the component supports it, toggle to dark mode. | The form and surrounding UI should switch to a dark theme. | |
