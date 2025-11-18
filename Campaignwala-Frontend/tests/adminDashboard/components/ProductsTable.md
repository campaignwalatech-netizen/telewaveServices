
# Test Cases for OffersTable Component

**Component:** `src/adminDashboard/components/ProductsTable.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| OT-001 | It should render the table with a header and data rows. | 1. Render the `OffersTable` component. | The component should display a header with the title "ALL Offers 18", filter/sort controls, an "Export" button, and a table with data. |
| OT-002 | It should render the correct number of offer rows. | 1. Render the component. | The table body should contain the same number of rows as the `Offers` data array (5 rows). |

---

### 2. Data Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| OT-003 | It should display the correct data in each cell. | 1. Render the component and inspect the first row. | The first row should correspond to the first item in the `Offers` array, showing the Google logo, date, stage, commission, etc. |
| OT-004 | It should render the company image correctly. | 1. Render the component and check the image cell for any row. | An `<img>` tag should be present with its `src` pointing to the company's image URL and `alt` as the company name. |
| OT-005 | It should use a placeholder if the image URL is missing. | 1. Modify the `Offers` data so one item has a null `image` property. <br> 2. Render the component. | The `<img>` tag for that row should have its `src` set to `"/placeholder.svg"`. |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| OT-006 | The "Export" button should trigger an alert. | 1. Render the component. <br> 2. Click the "Export" button. | An alert with the message "Exporting campaigns data..." should appear. |
| OT-007 | Filter and sort buttons should be present. | 1. Render the component. | Buttons for Filter, Sort Asc, Sort Desc, and More should be visible in the table header. |
| OT-008 | The "Action" button in each row should be clickable. | 1. Render the component. <br> 2. Click the `MoreVertical` button in any row. | The button should be interactive and show hover/focus states. No specific action is implemented in the code. |

---

### 4. Responsiveness

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| OT-009 | It should hide certain columns on smaller screens. | 1. Render the component and resize the viewport to a medium width (e.g., < 1024px). | The "WITHDR" column should be hidden. |
| OT-010 | It should hide more columns on very small screens. | 1. Render and resize the viewport to a small width (e.g., < 768px). | Both the "INTEGRATIONAL BONUS" and "WITHDR" columns should be hidden. |
| OT-011 | It should allow horizontal scrolling for the table on small screens. | 1. Render on a small screen where the table content overflows. | The table container should be horizontally scrollable. |

---
