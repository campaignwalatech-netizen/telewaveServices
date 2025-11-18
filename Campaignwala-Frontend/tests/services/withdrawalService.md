
# Manual Test Plan for Withdrawal Service

## Objective
To ensure that all withdrawal-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

**Note:** For each test case, you will need to have a valid authentication token (if required by the API).

### 1. Create Withdrawal Request
-   **Endpoint:** `POST /withdrawals`
-   **Steps:**
    1.  Send a `POST` request to `/withdrawals` with a valid withdrawal data payload (e.g., `{ "amount": 100, "currency": "USD" }`).
-   **Expected Result:**
    -   The API should return a `201 Created` status code.
    -   The response body should contain the newly created withdrawal request object.

### 2. Get All Withdrawals (Admin)
-   **Endpoint:** `GET /withdrawals`
-   **Steps:**
    1.  Send a `GET` request to `/withdrawals`.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain an array of withdrawal objects.

### 3. Get Withdrawal by ID
-   **Endpoint:** `GET /withdrawals/:id`
-   **Steps:**
    1.  Send a `GET` request to `/withdrawals/:id`, replacing `:id` with a valid withdrawal ID.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain the withdrawal object with the specified ID.

### 4. Approve Withdrawal (Admin)
-   **Endpoint:** `PUT /withdrawals/:id/approve`
-   **Steps:**
    1.  Send a `PUT` request to `/withdrawals/:id/approve`, replacing `:id` with a pending withdrawal ID.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain the updated withdrawal object with the status set to "approved".

### 5. Reject Withdrawal (Admin)
-   **Endpoint:** `PUT /withdrawals/:id/reject`
-   **Steps:**
    1.  Send a `PUT` request to `/withdrawals/:id/reject`, replacing `:id` with a pending withdrawal ID.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain the updated withdrawal object with the status set to "rejected".

### 6. Delete Withdrawal
-   **Endpoint:** `DELETE /withdrawals/:id`
-   **Steps:**
    1.  Send a `DELETE` request to `/withdrawals/:id`, replacing `:id` with a valid withdrawal ID.
-   **Expected Result:**
    -   The API should return a `204 No Content` or `200 OK` status code.
    -   The withdrawal should be removed from the system.

### 7. Get Withdrawal Statistics
-   **Endpoint:** `GET /withdrawals/stats`
-   **Steps:**
    1.  Send a `GET` request to `/withdrawals/stats`.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain withdrawal statistics.
