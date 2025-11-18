
# Test Cases for AddOffersForm Component

**Component:** `src/adminDashboard/forms/AddProjectForm.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AOF-001 | It should render the form with the title "Add New Offers". | 1. Render the `AddOffersForm` component. | The form should be displayed with the correct title and all its input fields. |
| AOF-002 | It should display a loading state for the category dropdown. | 1. Render the component while the category API call is in progress. | The category dropdown should be disabled and show a "Loading categories..." message. |
| AOF-003 | It should populate the category dropdown on successful API call. | 1. Mock a successful response from `getAllCategories`. <br> 2. Render the component. | The category dropdown should be enabled and contain the list of categories returned from the API. |
| AOF-004 | It should show an error if fetching categories fails. | 1. Mock a failed response from `getAllCategories`. <br> 2. Render the component. | An error message "Failed to load categories" should be displayed. The dropdown should show "Select Category". |

---

### 2. Form Interaction

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AOF-005 | It should update the form state on input change. | 1. Render the component. <br> 2. Type "New Offer" into the "Offer Name" input. | The component's state for `formData.name` should be updated to "New Offer". |
| AOF-006 | The "Cancel" button should reset the form. | 1. Fill in some data into the form fields. <br> 2. Click the "Cancel" button. | All the input fields in the form should be cleared. |

---

### 3. Form Submission

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AOF-007 | It should show an error if Commission 1 is not provided. | 1. Render the component. <br> 2. Fill out other fields but leave "Commission 1" empty. <br> 3. Click "Add Offer". | An error message "⚠️ Commission 1 is required!" should be displayed. The form should not be submitted. |
| AOF-008 | It should show a loading state while submitting. | 1. Fill the form correctly and click "Add Offer". <br> 2. Mock the `createOffer` service to have a delay. | The submit button should be disabled and show the text "Adding Offer...". |
| AOF-009 | It should call the `createOffer` service on submit. | 1. Fill the form and click submit. <br> 2. Mock the `createOffer` service. | The `createOffer` function should be called with the form data. |
| AOF-010 | It should display a success message and reset the form on successful submission. | 1. Mock a successful response from `createOffer`. <br> 2. Submit the form. | A success message "✅ Offer created successfully!" should be displayed. After a delay, the form fields should be cleared. |
| AOF-011 | It should display an error message on failed submission. | 1. Mock a failed response from `createOffer`. <br> 2. Submit the form. | An error message (e.g., "Failed to create offer") should be displayed. |

---
