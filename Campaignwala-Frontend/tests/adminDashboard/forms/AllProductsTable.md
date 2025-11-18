# Manual Test Cases for AllOffersTable Component

**Component:** `AllProductsTable.jsx` (Note: Component name is `AllOffersTable`)

## Objective
To ensure the `AllOffersTable` component correctly fetches, displays, searches, filters, and manages offers, including edit and delete functionality.

## Pre-requisites
-   Backend API for offers (`/api/offers`) and categories (`/api/categories`) should be running and accessible.
-   Mock data should be available in the database to test various states (e.g., approved offers, pending offers).

## Test Environment
-   **Browser:** Chrome, Firefox, Edge (Latest Versions)
-   **Device:** Desktop

---

### Test Case 1: Initial Load and Data Display

| Test Case ID | TC_AOT_01                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify the component shows a loading state and then displays the fetched offers correctly. |
| **Steps**        | 1. Navigate to the page containing the `AllOffersTable`.<br>2. Observe the initial state.<br>3. Wait for the data to load. |
| **Expected Result** | - A loading indicator ("Loading offers...") is shown initially.<br>- Once loaded, the table is populated with a list of offers.<br>- Each row displays the correct offer data (Image, Date, Name, Category, etc.).<br>- If the fetch fails, an error message with a "Try Again" button is displayed. |

---

### Test Case 2: Empty State

| Test Case ID | TC_AOT_02                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify the component shows a "No offers found" message when no offers are available. |
| **Steps**        | 1. Ensure the backend returns an empty array of offers.<br>2. Load the component. |
| **Expected Result** | - A message like "No offers found" is displayed instead of the table. |

---

### Test Case 3: Search Functionality

| Test Case ID | TC_AOT_03                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify that searching for an offer filters the table results.        |
| **Steps**        | 1. Type a known offer name into the search input field.<br>2. Press Enter or wait for the search to trigger. |
| **Expected Result** | - The table updates to show only the offers that match the search term. |

---

### Test Case 4: Filter by Status

| Test Case ID | TC_AOT_04                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify that filtering by status (All, Approved, Pending) works correctly. |
| **Steps**        | 1. Click the filter dropdown.<br>2. Select "Approved".<br>3. Select "Pending Approval".<br>4. Select "All Offers". |
| **Expected Result** | - When "Approved" is selected, only approved offers are shown.<br>- When "Pending Approval" is selected, only pending offers are shown.<br>- When "All Offers" is selected, all offers are displayed again. |

---

### Test Case 5: Delete Offer

| Test Case ID | TC_AOT_05                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify the delete functionality, including the confirmation modal.   |
| **Steps**        | 1. Click the `Trash2` icon on an offer row.<br>2. A confirmation modal should appear.<br>3. Click the "Cancel" button.<br>4. Click the `Trash2` icon again.<br>5. Click the "Delete" button. |
| **Expected Result** | - The modal appears with the offer's name.<br>- Clicking "Cancel" closes the modal with no change.<br>- Clicking "Delete" removes the offer from the table and shows a success alert. |

---

### Test Case 6: Edit Offer

| Test Case ID | TC_AOT_06                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify the edit functionality, including the edit modal and form submission. |
| **Steps**        | 1. Click the `Edit2` icon on an offer row.<br>2. An edit modal should appear with a form pre-filled with the offer's data.<br>3. Change a value in the form (e.g., the offer name).<br>4. Click the "Update Offer" button. |
| **Expected Result** | - The modal appears with the correct data.<br>- After updating, the modal closes.<br>- The table displays the updated information for that offer.<br>- A success alert is shown. |

---

### Test Case 7: Export to CSV

| Test Case ID | TC_AOT_07                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify that the "Export" button downloads a CSV file of the current offers. |
| **Steps**        | 1. Click the "Export" button.                                        |
| **Expected Result** | - A file named `offers_YYYY-MM-DD.csv` is downloaded by the browser.<br>- The file contains the correct headers and data for the offers visible in the table. |

---

### Test Case 8: Copy Link

| Test Case ID | TC_AOT_08                                                              |
| :----------- | :--------------------------------------------------------------------- |
| **Description**  | Verify that clicking the copy link button copies the link to the clipboard. |
| **Steps**        | 1. Find an offer with a link and click the `LinkIcon` button.<br>2. Try pasting the content into a text editor. |
| **Expected Result** | - A success alert "Link copied to clipboard!" appears.<br>- The correct offer link is pasted from the clipboard. |

---