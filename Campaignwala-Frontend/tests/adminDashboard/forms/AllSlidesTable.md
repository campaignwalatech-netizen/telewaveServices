
# Test Cases for AllSlidesTable Component

**Component:** `src/adminDashboard/forms/AllSlidesTable.jsx`

---

### 1. Basic Rendering and Data Fetching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AST-001 | It should display a loading state initially. | 1. Render the `AllSlidesTable` component. <br> 2. Mock the `slideService.getAllSlides` to have a delay. | A loading spinner should be visible. |
| AST-002 | It should fetch and display a grid of slides. | 1. Mock a successful response from `getAllSlides`. <br> 2. Render the component. | A grid of slide cards should be displayed, each showing its image, title, category, etc. |
| AST-003 | It should display an alert if fetching fails. | 1. Mock a failed response from `getAllSlides`. <br> 2. Render the component. | An alert with the message "Failed to load slides" should appear. |
| AST-004 | It should display a message when no slides are found. | 1. Mock a successful response with an empty array of slides. <br> 2. Render the component. | A message "No slides found" should be displayed. |

---

### 2. Searching

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AST-005 | It should filter slides by search term. | 1. Render with a list of slides. <br> 2. Type a search term into the search input. | The `fetchSlides` function should be called with the search term after a debounce, and the displayed grid should update. |
| AST-006 | It should show the number of results when searching. | 1. Perform a search that returns results. | A message like "2 results found for 'search term'" should be displayed. |
| AST-007 | The clear search button should clear the search input. | 1. Type a term in the search box. <br> 2. Click the `X` button in the search input. | The search input should be cleared, and the full list of slides should be re-fetched. |

---

### 3. Slide Card Actions

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AST-008 | The "Edit" button should navigate to the add/edit form. | 1. Render the component. <br> 2. Click the "Edit" button on a slide card. | The `useNavigate` hook should be called to navigate to `/admin/add-slide`, passing the slide data in the state. |
| AST-009 | The "Delete" button should open the confirmation modal. | 1. Render the component. <br> 2. Click the "Delete" button on a slide card. | The delete confirmation modal should appear. |

---

### 4. Deletion Process

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| AST-010 | It should call `deleteSlide` and remove the card on confirmed deletion. | 1. Mock `deleteSlide` to be successful. <br> 2. Open the delete modal and confirm. | The `deleteSlide` service should be called. The corresponding card should be removed from the grid, and a success alert should appear. |
| AST-011 | It should show an alert on failed deletion. | 1. Mock `deleteSlide` to fail. <br> 2. Confirm deletion. | An alert with an error message should be displayed, and the modal should close. |

---
