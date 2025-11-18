
# Test Cases for StatsCard Component

**Component:** `src/adminDashboard/components/StatsCard.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| STC-001 | It should render the stats card with all data points. | 1. Create a sample `stat` object with `title`, `value`, `icon`, `color`, and `change`. <br> 2. Render the `StatsCard` component with this object. | The card should display the icon in a colored background, the percentage change, the title, and the main value. |

---

### 2. Data Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| STC-002 | It should display the correct title. | 1. Render the component with `stat={{ title: 'Total Revenue' }}`. | The text "Total Revenue" should be visible on the card. |
| STC-003 | It should display the correct value. | 1. Render with `stat={{ value: '$45,231.89' }}`. | The text "$45,231.89" should be displayed prominently. |
| STC-004 | It should display the correct percentage change. | 1. Render with `stat={{ change: '+20.1%' }}`. | The text "+20.1%" should be visible, typically in green. |

---

### 3. Styling

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| STC-005 | It should apply the correct background color to the icon container. | 1. Render with `stat={{ color: 'bg-blue-500' }}`. | The `div` containing the icon should have the `bg-blue-500` class. |
| STC-006 | It should have a hover effect. | 1. Render the component. <br> 2. Hover the mouse over the card. | The card should scale up slightly, as defined by the `hover:scale-105` class. |

---
