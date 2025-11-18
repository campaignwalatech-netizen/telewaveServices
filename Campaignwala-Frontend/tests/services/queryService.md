
# Manual Test Plan for Query Service

## Objective
To ensure that all user query-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)

## Test Cases

1.  **Get All Queries:** `GET /queries`
    -   Test with various query parameters (`status`, `priority`, `search`, etc.).
2.  **Get Query by ID:** `GET /queries/:id`
    -   Test with a valid and invalid query ID.
3.  **Create Query:** `POST /queries`
    -   Test creating a new query with valid data.
4.  **Update Query:** `PUT /queries/:id`
    -   Test updating an existing query.
5.  **Delete Query:** `DELETE /queries/:id`
    -   Test deleting a query.
6.  **Add Reply:** `POST /queries/:id/reply`
    -   Test adding a reply to a query.
7.  **Update Query Status:** `PATCH /queries/:id/status`
    -   Test changing the status of a query (e.g., to 'Closed').
8.  **Get Query Stats:** `GET /queries/stats`
    -   Verify that query statistics are returned correctly.
9.  **Get Queries by Email:** `GET /queries/email/:email`
    -   Test fetching queries for a specific user email.
10. **Bulk Delete Queries:** `POST /queries/bulk-delete`
    -   Test deleting multiple queries at once by sending an array of query IDs.
