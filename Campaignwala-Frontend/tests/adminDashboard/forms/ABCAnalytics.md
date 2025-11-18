
# Test Cases for AnalyticsDashboard Component

**Component:** `src/adminDashboard/forms/ABCAnalytics.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ABC-001 | It should render the main dashboard title and description. | 1. Render the `AnalyticsDashboard` component. | The title "Analytics Dashboard" and its description should be visible. |
| ABC-002 | It should render the filter section with date range and dropdowns. | 1. Render the component. | A date range picker, a category dropdown, and a customer dropdown should be visible. |
| ABC-003 | It should render the metrics cards section. | 1. Render the component. | A grid of metric cards (e.g., "DateWise Count", "Total Count") should be displayed. |
| ABC-004 | It should render the chart sections. | 1. Render the component. | Sections for "Date Wise Account Created", "Pending Account Distribution", etc., should be visible with chart placeholders. |
| ABC-005 | It should render the legend section. | 1. Render the component. | A legend with account names and color codes should be visible at the bottom. |

---

### 2. Filter Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ABC-006 | It should open the calendar popup when the date range button is clicked. | 1. Render the component. <br> 2. Click the date range button. | A calendar popup with quick filters and a date picker should appear. |
| ABC-007 | It should close the calendar popup when a quick filter is selected. | 1. Open the calendar popup. <br> 2. Click on a quick filter like "Today" or "Last 7 days". | The calendar popup should close, and the date range in the button should update. |
| ABC-008 | It should update the date range when selecting dates from the calendar. | 1. Open the calendar. <br> 2. Select a start date, then an end date. | The date range in the main button should update to reflect the selection. |
| ABC-009 | It should update the displayed metrics when a different customer is selected. | 1. Render the component. <br> 2. Select a specific customer from the "All Customers" dropdown. | The data in the metrics cards should update to reflect the data for that specific customer. |
| ABC-010 | It should allow changing the category dropdown. | 1. Render the component. <br> 2. Select a different category from the "All Categories" dropdown. | The dropdown's value should update. (Note: No specific logic is tied to this dropdown in the code). |

---

### 3. Calendar Component

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ABC-011 | The calendar should display the correct month and year. | 1. Open the calendar popup. | The calendar should show the current month and year as managed by the component's state. |
| ABC-012 | It should navigate to the previous and next months. | 1. Open the calendar. <br> 2. Click the left and right chevron buttons. | The displayed month and year should change accordingly. |
| ABC-013 | It should highlight the selected date range. | 1. Open the calendar and select a date range. | The days within the selected range should have a different background color. |

---

### 4. Chart Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ABC-014 | It should render the LineChart for date-wise account creation. | 1. Render the component. | A line chart should be visible under the "Date Wise Account Created" section. |
| ABC-015 | It should render the PieCharts for account distributions. | 1. Render the component. | Pie charts (donut charts) should be visible under the "Pending Account", "Total Pending Account", and "Total Approved Account" sections. |
| ABC-016 | It should display a custom tooltip on chart hover. | 1. Render the component. <br> 2. Hover over a data point on the line chart or a segment on a pie chart. | A custom-styled tooltip with details about the data point should appear. |

---
