
# Test Cases for AddSlideForm Component

**Component:** `src/adminDashboard/forms/AddSlideForm.jsx`

---

### 1. Rendering (Add Mode)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ASF-ADD-001 | It should render the form in "Add New Slide" mode. | 1. Render the `AddSlideForm` component without any location state. | The form title should be "Add New Slide", and the submit button should say "Add Slide". |
| ASF-ADD-002 | It should fetch and display categories in the dropdown. | 1. Render the component. <br> 2. Mock the `categoryService.getAllCategories` to return a list of categories. | The "Category" dropdown should be populated with the fetched categories. |
| ASF-ADD-003 | The "Offers ID" dropdown should be disabled initially. | 1. Render the component. | The "Offers ID" dropdown should be disabled with a message like "First select a category". |

---

### 2. Rendering (Edit Mode)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ASF-EDIT-001 | It should render the form in "Edit Slide" mode. | 1. Render the component with a slide object in `location.state.editSlide`. | The form title should be "Edit Slide", and the submit button should say "Update Slide". |
| ASF-EDIT-002 | It should populate the form fields with slide data. | 1. Render in edit mode with a slide object. | The input fields (Offer Title, Category, etc.) should be pre-filled with the slide data. |
| ASF-EDIT-003 | It should fetch offers for the pre-selected category. | 1. Render in edit mode with a slide that has a category. | The component should automatically fetch and populate the "Offers ID" dropdown based on the slide's category. |
| ASF-EDIT-004 | It should show an image preview for the existing image. | 1. Render in edit mode with a slide that has a `backgroundImage`. | The image preview should be displayed. |

---

### 3. Form Interaction

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ASF-INT-001 | It should fetch and populate offers when a category is selected. | 1. Render the component. <br> 2. Select a category from the dropdown. | The "Offers ID" dropdown should become enabled and populated with offers corresponding to the selected category. |
| ASF-INT-002 | It should show a loading state while fetching offers. | 1. Select a category. <br> 2. Mock the `getOffersByCategory` service to have a delay. | The "Offers ID" dropdown should be disabled and show a "Loading offers..." message. |
| ASF-INT-003 | It should show a message if no offers are available. | 1. Select a category for which the API returns no offers. | The "Offers ID" dropdown should show a message like "No offers available in this category". |
| ASF-INT-004 | It should handle image selection and show a preview. | 1. Click the upload area and select a valid image. | An image preview should appear, and the base64 representation of the image should be stored in the state. |
| ASF-INT-005 | The "Reset" button should clear all form fields and the image preview. | 1. Fill in some data and select an image. <br> 2. Click the "Reset" button. | All form fields should be cleared, and the image preview should be removed. |

---

### 4. Form Submission

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ASF-SUB-001 | It should show an alert if required fields are missing. | 1. Leave a required field (e.g., Offer Title) empty. <br> 2. Click "Add Slide". | An alert should appear with a message like "Please fill all required fields!". |
| ASF-SUB-002 | It should call `createSlide` on submit in add mode. | 1. Fill all required fields and click "Add Slide". <br> 2. Mock the `slideService.createSlide` function. | The `createSlide` function should be called with the form data. |
| ASF-SUB-003 | It should call `updateSlide` on submit in edit mode. | 1. Render in edit mode, change a field, and click "Update Slide". <br> 2. Mock the `slideService.updateSlide` function. | The `updateSlide` function should be called with the slide ID and the updated data. |
| ASF-SUB-004 | It should show a success alert and navigate on successful submission. | 1. Mock a successful API response. <br> 2. Submit the form. | An alert like "Slide added successfully!" should appear, and the app should navigate to `/admin/slides`. |
| ASF-SUB-005 | It should show a specific error alert if the Offers ID already exists. | 1. Mock an API error response indicating a duplicate Offers ID. <br> 2. Submit the form. | An alert with the message "Offers ID Already Exists!" should appear. The Offers ID dropdown should be highlighted. |

---
