
# Test Cases for ProductsTable Component

**Component:** `src/components/ProductsTable.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TBL-001 | It should render the table with headers and data. | 1. Render the `OffersTable` component. | The component should display a header card with the title "ALL CAMPAIGNS" and an "Export" button. A table with headers (IMAGE, DATE, LATEST STAGE, etc.) and rows of offer data should be visible. |
| TBL-002 | It should display the correct number of rows. | 1. Render the `OffersTable` component. | The table body should contain the same number of rows as the `Offers` data array (5 rows). |

---

### 2. Data Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TBL-003 | It should display the correct data in each cell. | 1. Render the `OffersTable` component. <br> 2. Inspect the first row. | The first row should correspond to the first item in the `Offers` array, displaying the Google logo, date, stage, commission, etc. |
| TBL-004 | It should render the product image. | 1. Render the component. <br> 2. Check the image cell for any row. | An `<img>` tag should be present with the `src` attribute pointing to the product's image URL. The `alt` attribute should be the company name. |
| TBL-005 | It should render a placeholder if the image URL is missing. | 1. Modify the `Offers` data so one item has a null or undefined `image` property. <br> 2. Render the component. | The `<img>` tag for that row should have its `src` attribute set to `"/placeholder.svg"`. |
| TBL-006 | It should display the stage with correct styling. | 1. Render the component. <br> 2. Check the "LATEST STAGE" cell for any row. | The stage text (e.g., "UPLOAD") should be displayed within a styled `<span>` with a specific background color. |

---

### 3. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TBL-007 | It should show a hover effect on rows. | 1. Render the component. <br> 2. Hover the mouse over any data row. | The row's background color should change, as defined by the `hover:bg-muted/30` class. |
| TBL-008 | The "Action" button should be clickable. | 1. Render the component. <br> 2. Click the `MoreVertical` button in any row. | While there is no explicit action defined in the provided code, the button should be interactive (e.g., show a ripple or focus state). |
| TBL-009 | The "Export" button should be clickable. | 1. Render the component. <br> 2. Click the "Export" button in the header. | The button should be interactive. No specific export functionality is implemented in the code, but the button itself should be functional. |

---

### 4. Responsiveness

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| TBL-010 | It should hide certain columns on smaller screens. | 1. Render the component. <br> 2. Resize the viewport to a medium width (e.g., between 768px and 1024px). | The "INTEGRATIONAL BONUS" column should be visible, but the "WITHDR" column should be hidden. |
| TBL-011 | It should hide more columns on very small screens. | 1. Render the component. <br> 2. Resize the viewport to a small width (e.g., less than 768px). | Both the "INTEGRATIONAL BONUS" and "WITHDR" columns should be hidden. |
| TBL-012 | It should allow horizontal scrolling on small screens. | 1. Render the component on a small screen where the table content overflows. | The table should be horizontally scrollable. |

---
