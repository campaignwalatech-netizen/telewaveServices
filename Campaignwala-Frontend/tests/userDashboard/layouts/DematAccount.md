# Manual Test Cases for DematAccount (Offers Page)

**Component:** `src/userDashboard/layouts/DematAccount.jsx`

**Objective:** To verify the display, data fetching, and navigation of the category-specific offers page.

---

### Test Case 1: Render the Page with Data from API

| Test Case ID | TC_DEMAT_01                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page correctly fetches and displays offers for a given category. |
| **Prerequisites** | The `offerService.getOffersByCategory` API should return a list of offers for the specified category ID. |
| **Steps**      | 1. Navigate to `/user/category-offers/:categoryId`, where `:categoryId` is a valid ID. Pass a `categoryName` in the route state. |
| **Expected Result** | The page should display:<br>- The title "Browse Available Offers".<br>- A tab showing the `categoryName`.<br>- A grid of offer cards, with each card showing the offer's name, description, and commission.<br>- A "Share" button on each card. |

---

### Test Case 2: API Loading State

| Test Case ID | TC_DEMAT_02                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a loading indicator is shown while offers are being fetched. |
| **Steps**      | 1. Navigate to an offers page.<br>2. Observe the page while the API call is in progress (a delay may need to be simulated). |
| **Expected Result** | A loading spinner and the text "Loading offers..." should be displayed. |

---

### Test Case 3: API Returns No Offers

| Test Case ID | TC_DEMAT_03                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that a fallback message is shown when the API returns no offers for a category. |
| **Prerequisites** | The API returns an empty array for the given category. |
| **Steps**      | 1. Navigate to an offers page for a category with no offers. |
| **Expected Result** | The page should display a message like "No offers available in [Category Name] at the moment."<br>A "Back to Dashboard" button should be visible. |

---

### Test Case 4: "Back to Dashboard" Navigation

| Test Case ID | TC_DEMAT_04                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Back to Dashboard" button works correctly when no offers are found. |
| **Prerequisites** | The page is in the "No Offers" state. |
| **Steps**      | 1. Click the "Back to Dashboard" button. |
| **Expected Result** | The user should be navigated to the main user dashboard (`/user/dashboard`). |

---

### Test Case 5: "Share" Button Navigation

| Test Case ID | TC_DEMAT_05                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Share" button navigates to the correct page. |
| **Prerequisites** | The page has successfully loaded offers. |
| **Steps**      | 1. Click the "Share" button on any offer card. |
| **Expected Result** | The user should be navigated to the zero-fee demat page with the specific offer ID in the URL, e.g., `/user/zerofee-demat/:offerId`. |

---

### Test Case 6: Fallback Data Fetching

| Test Case ID | TC_DEMAT_06                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the component can fetch and filter all offers if no specific `categoryId` is provided. |
| **Prerequisites** | The `offerService.getAllOffers` API should be functional. |
| **Steps**      | 1. Navigate to the page with a `categoryId` of `fallback`, passing a `categoryName` in the state to filter by. |
| **Expected Result** | The page should display offers from the general list that match the category name. |

---

### Test Case 7: Dark Mode Rendering

| Test Case ID | TC_DEMAT_07                                        |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. View the page with dark mode enabled. |
| **Expected Result** | All elements, including the background, text, buttons, and cards, should have colors consistent with the dark theme. |
