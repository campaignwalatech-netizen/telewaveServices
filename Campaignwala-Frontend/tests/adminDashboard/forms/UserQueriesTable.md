
# Test Cases for UserQueriesTable Component

**Component:** `src/adminDashboard/forms/UserQueriesTable.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UQT-001 | It should render the main title and a list of query cards. | 1. Render the `UserQueriesTable` component within a `ThemeProvider`. | The title "QUERIES" should be visible, along with a list of cards, each representing a user query. |
| UQT-002 | It should display the correct data on each query card. | 1. Render the component. <br> 2. Inspect the first query card. | The card should show the user's name, date, subject, message, and email. |
| UQT-003 | The "Reply" button text should change based on reply status. | 1. Render the component. <br> 2. Observe a query that has not been replied to. <br> 3. Observe a query that has been replied to. | The button should say "Reply" for the un-replied query and "Reply Again" for the replied one. |
| UQT-004 | It should show the number of replies if any exist. | 1. Render a query card that has replies. | A message like "2 Replies Sent" should be visible on the card. |

---

### 2. Reply Modal Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UQT-005 | It should open the reply modal when a "Reply" button is clicked. | 1. Click the "Reply" or "Reply Again" button on any card. | A modal with the title "Reply to Query" should appear. |
| UQT-006 | The modal should display the original query details. | 1. Open the reply modal. | The modal should show the details of the selected query (From, Date, Subject, Message). |
| UQT-007 | The modal should display previous replies if they exist. | 1. Open the modal for a query that has previous replies. | A section "Previous Replies:" should be visible, listing all the past replies. |
| UQT-008 | The "Send Reply" button should be disabled when the reply message is empty. | 1. Open the reply modal. | The "Send Reply" button should be disabled. |
| UQT-009 | The "Send Reply" button should be enabled when a message is typed. | 1. Open the modal and type a message into the textarea. | The "Send Reply" button should become enabled. |
| UQT-010 | It should close the modal when the `X` or "Cancel" button is clicked. | 1. Open the modal. <br> 2. Click the `X` button, then repeat and click "Cancel". | The modal should close on each click. |

---

### 3. Sending a Reply

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| UQT-011 | It should add the new reply to the query's state. | 1. Open the modal, type a reply, and click "Send Reply". | The modal should close. The `status` of the query should update to "Replied", and the new reply should be added to its `replies` array. |
| UT-012 | The UI should update to reflect the new reply. | 1. Send a reply to a previously un-replied query. | The "Reply" button on the card should change to "Reply Again", and the reply count should appear. |

---
