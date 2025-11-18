
# Test Cases for AllCategoriesTable Component

**Component:** `src/adminDashboard/forms/AllCategoriesTable.jsx`

---

### 1. Basic Rendering and Data Fetching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACT-001 | It should display a loading state initially. | 1. Render the `AllCategoriesTable` component. <br> 2. Mock the `getAllCategories` service to have a delay. | A loading spinner with the text "Loading categories..." should be visible. |
| ACT-002 | It should fetch and display a grid of categories. | 1. Mock a successful response from `getAllCategories` with a list of categories. <br> 2. Render the component. | A grid of category cards should be displayed, each showing its name, description, and offer count. |
| ACT-003 | It should display an error message if fetching fails. | 1. Mock a failed response from `getAllCategories`. <br> 2. Render the component. | An error message with a "Try Again" button should be displayed. |
| ACT-004 | It should display a message when no categories are found. | 1. Mock a successful response with an empty array of categories. <br> 2. Render the component. | A message "No categories found" with an "Add New Category" button should be displayed. |

---

### 2. Filtering and Searching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACT-005 | It should filter categories by search term. | 1. Render with a list of categories. <br> 2. Type a search term into the search input. | The `fetchCategories` function should be called with the search term, and the displayed grid should update to show only matching categories. |
| ACT-006 | It should filter categories by status. | 1. Render with categories having different statuses. <br> 2. Select "Active" from the status filter dropdown. | The `fetchCategories` function should be called with `status: 'active'`, and only active categories should be displayed. |

---

### 3. Category Card Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACT-007 | The "Edit" button should navigate to the add/edit form. | 1. Render the component. <br> 2. Click the "Edit" button on a category card. | The `useNavigate` hook should be called to navigate to `/admin/add-category`, passing the category data in the state. |
| ACT-008 | The "Delete" button should open the confirmation modal. | 1. Render the component. <br> 2. Click the "Delete" button on a category card. | The delete confirmation modal should appear, showing the name of the category to be deleted. |

---

### 4. Deletion Process

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACT-009 | The delete modal should close when "Cancel" is clicked. | 1. Open the delete modal. <br> 2. Click the "Cancel" button. | The modal should disappear. |
| ACT-010 | It should call the `deleteCategory` service on confirm. | 1. Open the delete modal and click "Delete". <br> 2. Mock the `deleteCategory` service. | The `deleteCategory` function should be called with the correct category ID. A loading state should be shown on the button. |
| ACT-011 | It should remove the category from the grid on successful deletion. | 1. Mock a successful response from `deleteCategory`. <br> 2. Open the modal and confirm deletion. | The modal should close, an alert should appear, and the corresponding category card should be removed from the display. |
| ACT-012 | It should show an alert on failed deletion. | 1. Mock a failed response from `deleteCategory`. <br> 2. Confirm deletion in the modal. | An alert with an error message should be displayed. The modal should remain open, and the loading state should be removed. |

---

### 5. Other Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ACT-013 | The "Add New Category" button should navigate to the add form. | 1. Render the component. <br> 2. Click the floating `+` button. | The app should navigate to `/admin/add-category`. |
| ACT-014 | The "Export" button should trigger a CSV download. | 1. Render with a list of categories. <br> 2. Click the "Export" button. | A CSV file containing the category data should be downloaded. |

---
