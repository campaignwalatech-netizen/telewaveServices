# Manual Test Cases for OffersGrid

**Component:** `src/userDashboard/components/OffersGrid.jsx`

**Objective:** To verify the correct rendering and display of the offers grid.

---

### Test Case 1: Render the Offers Grid

| Test Case ID | TC_OFFERSGRID_01                                   |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the grid of offers renders correctly with all its elements. |
| **Steps**      | 1. Navigate to a page that includes the `OffersGrid` component. |
| **Expected Result** | The page should display:<br>- A heading "Available Offers".<br>- A grid of offer cards.<br>- Each card should contain an image, a name, and a reward description. |

---

### Test Case 2: Verify Card Content

| Test Case ID | TC_OFFERSGRID_02                                   |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the content of the offer cards is displayed as expected. |
| **Steps**      | 1. Inspect the content of each card in the grid. |
| **Expected Result** | The content should match the hardcoded `offers` array in the component:<br>- "IndusInd Bank Credit Card" with its reward.<br>- "Bajaj EMI Card" with its reward.<br>- "Demat Account" with its reward.<br>- "Savings Account" with its reward. |

---

### Test Case 3: Hover State

| Test Case ID | TC_OFFERSGRID_03                                   |
|--------------|----------------------------------------------------|
| **Description**  | Verify the hover effect on the offer cards. |
| **Steps**      | 1. Hover the mouse cursor over one of the offer cards. |
| **Expected Result** | The card should display a shadow effect (`shadow-xl`), indicating it is interactive. |
