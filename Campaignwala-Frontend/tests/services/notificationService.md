
# Manual Test Plan for Notification Service

## Objective
To ensure that all notification-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)

## Test Cases

1.  **Send Notification:** `POST /notifications/send`
    -   Test sending a notification with various data payloads (different types, recipients, etc.).
2.  **Get All Notifications:** `GET /notifications`
    -   Test with and without query parameters (`type`, `status`, `search`, etc.).
3.  **Get Notification by ID:** `GET /notifications/:id`
    -   Test with a valid and invalid notification ID.
4.  **Delete Notification:** `DELETE /notifications/:id`
    -   Test deleting a notification.
5.  **Bulk Delete Notifications:** `POST /notifications/bulk-delete`
    -   Test deleting multiple notifications at once.
6.  **Get Notification Stats:** `GET /notifications/stats`
    -   Verify that notification statistics are returned correctly.
7.  **Get User Notifications:** `GET /notifications/user`
    -   Test fetching notifications for the currently logged-in user.
