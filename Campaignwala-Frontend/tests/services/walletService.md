
# Manual Test Plan for Wallet Service

## Objective
To ensure that all wallet-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

**Note:** For each test case, you will need to have a valid authentication token (if required by the API).

### 1. Get Wallet by User ID
-   **Endpoint:** `GET /wallet/user/:userId`
-   **Steps:**
    1.  Send a `GET` request to `/wallet/user/:userId`, replacing `:userId` with a valid user ID.
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain the wallet object for the specified user.

### 2. Add Credit to Wallet
-   **Endpoint:** `POST /wallet/credit`
-   **Steps:**
    1.  Send a `POST` request to `/wallet/credit` with a valid payload (e.g., `{ "userId": "123", "amount": 100 }`).
-   **Expected Result:**
    -   The API should return a `200 OK` or `201 Created` status code.
    -   The response body should contain the updated wallet object.

### 3. Add Debit to Wallet
-   **Endpoint:** `POST /wallet/debit`
-   **Steps:**
    1.  Send a `POST` request to `/wallet/debit` with a valid payload (e.g., `{ "userId": "123", "amount": 50 }`).
-   **Expected Result:**
    -   The API should return a `200 OK` or `201 Created` status code.
    -   The response body should contain the updated wallet object.

### 4. Get All Wallets (Admin)
-   **Endpoint:** `GET /wallet/all`
-   **Steps:**
    1.  Send a `GET` request to `/wallet/all` (requires admin privileges).
-   **Expected Result:**
    -   The API should return a `200 OK` status code.
    -   The response body should contain an array of all wallet objects.
