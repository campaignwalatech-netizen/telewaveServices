
# Manual Test Plan for Admin Log Service

## Objective
To ensure that all admin log-related API endpoints and client-side functions are working correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

### API Endpoints

1.  **Get All Admin Logs:** `GET /adminlogs`
    -   Test with various query parameters (`severity`, `actionType`, `search`, etc.).
2.  **Get Admin Log by ID:** `GET /adminlogs/:id`
    -   Test with a valid and invalid log ID.
3.  **Create Admin Log:** `POST /adminlogs`
    -   This is typically called by other services. Verify that actions in the admin dashboard (e.g., updating a user) create a corresponding log entry.
4.  **Delete Admin Log:** `DELETE /adminlogs/:id`
    -   Test deleting a log entry.
5.  **Get Admin Log Stats:** `GET /adminlogs/stats`
    -   Verify that log statistics are returned correctly.
6.  **Bulk Delete Admin Logs:** `POST /adminlogs/bulk-delete`
    -   Test deleting multiple logs at once.
7.  **Clear Old Logs:** `POST /adminlogs/clear-old`
    -   Test clearing logs older than a specified number of days.

### Client-Side Functions

1.  **Export to CSV / Download CSV**
    -   **Steps:**
        1.  Navigate to the admin logs page in the application.
        2.  Click the "Export to CSV" or "Download CSV" button.
    -   **Expected Result:**
        -   A CSV file containing the currently displayed logs should be downloaded.
        -   The content of the CSV file should be correctly formatted.
