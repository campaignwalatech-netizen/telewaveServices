
# Test Cases for AddCategoryForm Component

**Component:** `src/adminDashboard/forms/AddCategoryForm.jsx`

---

### 1. Rendering (Add Mode)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACF-ADD-001 | It should render the form in "Add New Category" mode. | 1. Render the `AddCategoryForm` component without any state in the location. | The form title should be "Add New Category", and the submit button should say "Add Category". All fields should be empty. |
| ACF-ADD-002 | It should render all form fields correctly. | 1. Render the component in add mode. | The form should contain inputs for Category Name, Description, Icon Name, an upload area for an icon image, and a status dropdown. |

---

### 2. Rendering (Edit Mode)

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACF-EDIT-001 | It should render the form in "Edit Category" mode. | 1. Navigate to the form's route with a category object in `location.state.editCategory`. | The form title should be "Edit Category", and the submit button should say "Update Category". |
| ACF-EDIT-002 | It should populate the form fields with the provided category data. | 1. Render in edit mode with a category object containing a name, description, etc. | The input fields should be pre-filled with the data from the `editCategory` object. |
| ACF-EDIT-003 | It should show the image preview if an `iconImage` URL is provided. | 1. Render in edit mode with an `iconImage` URL in the `editCategory` object. | The image preview should be displayed instead of the upload box. |

---

### 3. Form Interaction

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACF-INT-001 | It should update the form state when input values change. | 1. Render the component. <br> 2. Type "Test" into the "Category Name" input. | The component's state for `formData.name` should be updated to "Test". |
| ACF-INT-002 | It should handle image selection and show a preview. | 1. Click the upload area. <br> 2. Select a valid image file. | An image preview should appear, and the selected file should be stored in the component's state. |
| ACF-INT-003 | It should allow removing a selected image. | 1. Select an image to show the preview. <br> 2. Click the `X` button on the preview. | The preview should disappear, and the image file should be removed from the state. |
| ACF-INT-004 | It should show an alert for invalid file types. | 1. Click to upload and select a non-image file (e.g., a `.txt` file). | An alert should appear with a message like "Please select a valid image file". |
| ACF-INT-005 | It should show an alert for oversized files. | 1. Click to upload and select an image file larger than 5MB. | An alert should appear with a message like "File size should be less than 5MB". |

---

### 4. Form Submission

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACF-SUB-001 | It should show a loading state while submitting. | 1. Fill the form and click "Add Category". <br> 2. Mock the API call to have a delay. | The submit button should be disabled and show a loading spinner with text like "Adding...". |
| ACF-SUB-002 | It should call the `createCategory` service on submit in add mode. | 1. Render in add mode, fill the form, and click submit. <br> 2. Mock the `createCategory` service. | The `createCategory` function should be called with the form data. |
| ACF-SUB-003 | It should call the `updateCategory` service on submit in edit mode. | 1. Render in edit mode, change a field, and click submit. <br> 2. Mock the `updateCategory` service. | The `updateCategory` function should be called with the category ID and the updated form data. |
| ACF-SUB-004 | It should display a success message and navigate on successful submission. | 1. Mock a successful API response. <br> 2. Submit the form. | A success message should be displayed. After a short delay, the app should navigate to `/admin/categories`. |
| ACF-SUB-005 | It should display an error message on failed submission. | 1. Mock a failed API response. <br> 2. Submit the form. | An error message should be displayed on the form. The loading state should be removed. |

---
