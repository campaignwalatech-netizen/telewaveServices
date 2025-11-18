
# Manual Test Plan for Lead Service

## Objective
To ensure that all lead-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)

## Test Cases

1.  **Get All Leads:** `GET /leads`
    -   Test with and without query parameters.
2.  **Get Lead by ID:** `GET /leads/:id`
    -   Test with a valid and invalid lead ID.
3.  **Create Lead:** `POST /leads`
    -   Test creating a new lead with valid data.
4.  **Update Lead Status:** `PUT /leads/:id`
    -   Test updating the status of an existing lead.
5.  **Delete Lead:** `DELETE /leads/:id`
    -   Test deleting a lead.
6.  **Approve Lead:** `POST /leads/:id/approve`
    -   Test approving a pending lead.
7.  **Reject Lead:** `POST /leads/:id/reject`
    -   Test rejecting a pending lead with a reason.
8.  **Get Lead Stats:** `GET /leads/stats`
    -   Verify that lead statistics are returned correctly.
9.  **Get Lead Analytics:** `GET /leads/analytics`
    -   Test with various query parameters to filter the analytics data.
10. **Get All Users (for dropdown):** `GET /leads/users`
    -   Verify that a list of users is returned for populating a dropdown menu.
