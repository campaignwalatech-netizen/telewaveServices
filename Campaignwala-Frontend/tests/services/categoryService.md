
# Manual Test Plan for Category Service

## Objective
To ensure that all category-related API endpoints and utility functions are working correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

### API Endpoints

1.  **Get All Categories:** `GET /categories`
    -   Test with and without query parameters (`status`, `search`, etc.).
2.  **Get Category by ID:** `GET /categories/:id`
    -   Test with a valid and invalid category ID.
3.  **Create Category:** `POST /categories`
    -   Test creating a new category with valid data, including an icon/image.
4.  **Update Category:** `PUT /categories/:id`
    -   Test updating an existing category.
5.  **Delete Category:** `DELETE /categories/:id`
    -   Test deleting a category.
6.  **Get Category Stats:** `GET /categories/stats`
    -   Verify that category statistics are returned correctly.

### Utility Functions

1.  **convertImageToBase64**
    -   **Steps:**
        1.  In the browser console, create a dummy `File` object.
        2.  Call the `convertImageToBase64` function with the file.
    -   **Expected Result:**
        -   The function should return a Promise that resolves with a base64 encoded string of the image.
