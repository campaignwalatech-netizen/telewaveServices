
# Manual Test Plan for Offer Service

## Objective
To ensure that all offer-related API endpoints are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)

## Test Cases

1.  **Get All Offers:** `GET /offers`
    -   Test with and without query parameters (`status`, `category`, `search`, etc.).
2.  **Get Offer by ID:** `GET /offers/:id`
    -   Test with a valid and invalid offer ID.
3.  **Create Offer:** `POST /offers`
    -   Test creating a new offer with valid data.
4.  **Update Offer:** `PUT /offers/:id`
    -   Test updating an existing offer.
5.  **Delete Offer:** `DELETE /offers/:id`
    -   Test deleting an offer.
6.  **Approve Offer:** `POST /offers/:id/approve`
    -   Test approving a pending offer.
7.  **Reject Offer:** `POST /offers/:id/reject`
    -   Test rejecting a pending offer with a reason.
8.  **Get Offer Stats:** `GET /offers/stats`
    -   Verify that offer statistics are returned correctly.
9.  **Bulk Upload Offers:** `POST /offers/bulk-upload`
    -   Test uploading multiple offers at once.
10. **Get Offers by Category:** `GET /offers/category/:categoryId`
    -   Test fetching offers for a specific category.
