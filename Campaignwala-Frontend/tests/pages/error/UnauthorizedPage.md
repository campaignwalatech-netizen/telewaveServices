# Manual Test Cases for UnauthorizedPage

**Component:** `UnauthorizedPage.jsx`

**Objective:** To verify the display and functionality of the Access Denied / Unauthorized page.

---

### Test Case 1: Render the Unauthorized Page

| Test Case ID | TC_UNAUTHORIZED_01                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the unauthorized page renders correctly. |
| **Steps**      | 1. Attempt to navigate to a URL that the current user role does not have permission to access. |
| **Expected Result** | The page should display:<br>- An "Access Denied" heading.<br>- A message like "You don't have permission to access this resource."<br>- A "Go to Dashboard" button.<br>- A "Go Back" button. |

---

### Test Case 2: Display Attempted Location

| Test Case ID | TC_UNAUTHORIZED_02                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the page can display the path the user attempted to access. |
| **Prerequisites** | The navigation to the unauthorized page includes the `from` location in the state. |
| **Steps**      | 1. Navigate to a restricted page. |
| **Expected Result** | The page should display the path of the attempted location, e.g., "Attempted to access: /admin/settings". |

---

### Test Case 3: "Go Back" Button Functionality

| Test Case ID | TC_UNAUTHORIZED_03                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the "Go Back" button navigates the user to the previous page. |
| **Steps**      | 1. Navigate from a known page to a restricted URL.<br>2. On the Unauthorized page, click the "Go Back" button. |
| **Expected Result** | The user should be navigated back to the known page. |

---

### Test Case 4: "Go to Dashboard" for a Guest User

| Test Case ID | TC_UNAUTHORIZED_04                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Dashboard" button navigates an unauthenticated user to the login page. |
| **Prerequisites** | The user is not logged in. |
| **Steps**      | 1. Land on the unauthorized page.<br>2. Click the "Go to Dashboard" button. |
| **Expected Result** | The user should be redirected to the guest home page (e.g., `/login`). |

---

### Test Case 5: "Go to Dashboard" for an Authenticated User

| Test Case ID | TC_UNAUTHORIZED_05                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Dashboard" button navigates an authenticated user to their correct dashboard. |
| **Prerequisites** | The user is logged in with the 'user' role. |
| **Steps**      | 1. Land on the unauthorized page.<br>2. Click the "Go to Dashboard" button. |
| **Expected Result** | The user should be redirected to their user dashboard (e.g., `/user`). |

---

### Test Case 6: "Go to Dashboard" for an Authenticated Admin

| Test Case ID | TC_UNAUTHORIZED_06                                 |
|--------------|----------------------------------------------------|
| **Description**  | Verify the "Go to Dashboard" button navigates an admin user to the admin dashboard. |
| **Prerequisites** | The user is logged in with the 'admin' role. |
| **Steps**      | 1. Land on the unauthorized page.<br>2. Click the "Go to Dashboard" button. |
| **Expected Result** | The user should be redirected to the admin dashboard (e.g., `/admin`). |
