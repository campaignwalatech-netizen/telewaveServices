# Manual Test Cases for OverviewCards

**Component:** `src/userDashboard/components/OverviewCards.jsx`

**Objective:** To verify the correct rendering and display of the overview statistics cards.

---

### Test Case 1: Render the Overview Cards

| Test Case ID | TC_OVERVIEWCARDS_01                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the grid of overview cards renders correctly. |
| **Steps**      | 1. Navigate to a page that includes the `OverviewCards` component. |
| **Expected Result** | The page should display a grid of three cards:<br>- "Current Balance"<br>- "Total Earnings"<br>- "Total Bonus" |

---

### Test Case 2: Verify Card Content

| Test Case ID | TC_OVERVIEWCARDS_02                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the content of the cards is displayed as expected. |
| **Steps**      | 1. Inspect the content of each card in the grid. |
| **Expected Result** | Each card should display a title, a large value (e.g., "₹ 5,200.75"), and a smaller note below it (e.g., "+₹250.00 from last week"). The content should match the hardcoded `data` array in the component. |

---

### Test Case 3: Hover State

| Test Case ID | TC_OVERVIEWCARDS_03                                |
|--------------|----------------------------------------------------|
| **Description**  | Verify the hover effect on the overview cards. |
| **Steps**      | 1. Hover the mouse cursor over one of the cards. |
| **Expected Result** | The card should display a shadow effect (`shadow-lg`), indicating it is interactive. |
