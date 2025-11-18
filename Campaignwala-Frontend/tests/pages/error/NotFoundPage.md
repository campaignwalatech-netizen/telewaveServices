# Manual Test Cases for NotFoundPage

**Component:** `NotFoundPage.jsx`

**Objective:** To verify the display and functionality of the 404 Not Found page.

---

### Test Case 1: Render the Not Found Page

| Test Case ID | TC_NOTFOUND_01                                     |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the 404 page renders correctly with all UI elements. |
| **Steps**      | 1. Navigate to a non-existent URL within the application. |
| **Expected Result** | The page should display:<br>- A "404" heading.<br>- A "Page Not Found" message.<br>- A "Go to Home" button.<br>- A "Go Back" button. |

---

### Test Case 2: "Go Back" Button Functionality

| Test Case ID | TC_NOTFOUND_02                                     |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Go Back" button navigates the user to the previous page. |
| **Steps**      | 1. Navigate from a known page (e.g., `/login`) to a non-existent URL.<br>2. Click the "Go Back" button. |
| **Expected Result** | The user should be navigated back to the known page (`/login`). |

---

### Test Case 3: "Go to Home" Button for a Guest User

| Test Case ID | TC_NOTFOUND_03                                     |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Home" button navigates an unauthenticated user to the login page. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Navigate to a non-existent URL.<br>2. Click the "Go to Home" button. |
| **Expected Result** | The user should be redirected to the guest home page (e.g., `/login` or `/`). |

---

### Test Case 4: "Go to Home" Button for an Authenticated User (e.g., 'user' role)

| Test Case ID | TC_NOTFOUND_04                                     |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Home" button navigates an authenticated 'user' to their dashboard. |
| **Prerequisites** | The user is logged in with the 'user' role. |
| **Steps**      | 1. Navigate to a non-existent URL.<br>2. Click the "Go to Home" button. |
| **Expected Result** | The user should be redirected to the user dashboard (e.g., `/user`). |

---

### Test Case 5: "Go to Home" Button for an Authenticated User (e.g., 'admin' role)

| Test Case ID | TC_NOTFOUND_05                                     |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Home" button navigates an authenticated 'admin' to their dashboard. |
| **Prerequisites** | The user is logged in with the 'admin' role. |
| **Steps**      | 1. Navigate to a non-existent URL.<br>2. Click the "Go to Home" button. |
| **Expected Result** | The user should be redirected to the admin dashboard (e.g., `/admin`). |
