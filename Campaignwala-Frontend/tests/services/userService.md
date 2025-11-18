
# Manual Test Plan for User Service

## Objective
To ensure that all user-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

**Note:** For each test case, you will need a valid authentication token (if required by the API), and for admin-only endpoints, you'll need an admin user's token.

### User Management

1.  **Get All Users:** `GET /users`
    -   Test with and without query parameters (`page`, `limit`, `role`, `isActive`, `search`).
2.  **Get User by ID:** `GET /users/:userId`
    -   Test with a valid and invalid `userId`.
3.  **Update User:** `PUT /users/:userId`
    -   Test updating various user fields.
4.  **Update User Role (Admin):** `PUT /users/:userId/role`
    -   Test changing a user's role to 'admin' and back to 'user'.
5.  **Toggle User Status (Admin):** `PUT /users/:userId/toggle-status`
    -   Test activating and deactivating a user.
6.  **Delete User (Admin):** `DELETE /users/:userId`
    -   Test deleting a user and verifying they are removed.
7.  **Mark User as Ex (Admin):** `PUT /users/:userId/mark-ex`
    -   Test marking a user as an ex-employee.

### KYC Management

1.  **Get KYC Details:** `GET /users/kyc`
    -   Test for a user who has and has not submitted KYC.
2.  **Update KYC Details:** `PUT /users/kyc`
    -   Test submitting and updating personal, document, and bank details.
3.  **Get Pending KYC (Admin):** `GET /users/admin/kyc/pending`
    -   Test to see if it returns a list of users with pending KYC.
4.  **Get KYC by User ID (Admin):** `GET /users/admin/kyc/:userId`
    -   Test with a user ID that has pending KYC.
5.  **Approve KYC (Admin):** `PUT /users/admin/kyc/:userId/approve`
    -   Test approving a pending KYC request.
6.  **Reject KYC (Admin):** `PUT /users/admin/kyc/:userId/reject`
    -   Test rejecting a pending KYC request with a reason.

### Statistics

1.  **Get User Stats:** `GET /users/:userId/stats` (Note: The code implements a different logic, this is a suggestion based on the function name)
    -   Verify that the stats (leads, wallet, etc.) are calculated correctly.
2.  **Get All Users with Stats:** `GET /users/with-stats` (Note: The code implements a different logic, this is a suggestion based on the function name)
    -   Verify that the stats for all users are returned.
