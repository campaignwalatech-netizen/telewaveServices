
# Manual Test Plan for Slide Service

## Objective
To ensure that all slide-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)

## Test Cases

1.  **Get All Slides:** `GET /slides`
    -   Test with and without query parameters (e.g., `page`, `limit`).
2.  **Get Slide by ID:** `GET /slides/:id`
    -   Test with a valid and invalid slide ID.
3.  **Create Slide:** `POST /slides`
    -   Test creating a new slide with valid data.
4.  **Update Slide:** `PUT /slides/:id`
    -   Test updating an existing slide.
5.  **Delete Slide:** `DELETE /slides/:id`
    -   Test deleting a slide.
6.  **Get Slide Stats:** `GET /slides/stats`
    -   Verify that slide statistics are returned correctly.
7.  **Update Slide Order:** `PATCH /slides/order/update`
    -   Test reordering slides by sending an array of slide objects with updated order values.
8.  **Increment Slide Views:** `PATCH /slides/:id/view`
    -   Verify that the view count for a slide is incremented.
