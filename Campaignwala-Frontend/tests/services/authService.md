
# Manual Test Plan for Authentication Service

## Objective
To ensure that all authentication-related API endpoints and local storage operations are functioning correctly.

## Tools
-   API client (e.g., Postman, Insomnia)
-   Browser with developer tools

## Test Cases

### Authentication Flow

1.  **Send OTP:** `POST /users/send-otp`
    -   Test with a valid and invalid phone number.
2.  **Verify OTP:** `POST /users/verify-otp`
    -   Test with a correct and incorrect OTP.
3.  **Register:** `POST /users/register`
    -   Test registering a new user with valid data.
4.  **Login:** `POST /users/login`
    -   Test logging in with correct and incorrect credentials.
5.  **Logout:**
    -   Verify that clicking the logout button clears authentication data from local storage (`isLoggedIn`, `accessToken`, etc.).

### Password Management

1.  **Forgot Password:** `POST /users/forgot-password`
    -   Test requesting a password reset OTP with a valid phone number.
2.  **Reset Password:** `POST /users/reset-password`
    -   Test resetting the password with a valid OTP and new password.
3.  **Change Password:** `POST /users/change-password`
    -   Test changing the password while logged in.

### Profile Management

1.  **Get Profile:** `GET /users/profile`
    -   Verify that the correct user profile is returned.
2.  **Update Profile:** `PUT /users/profile`
    -   Test updating user profile information.

### Local Storage

-   **After Login:**
    -   Check local storage to ensure `isLoggedIn`, `accessToken`, `refreshToken`, `user`, and `userType` are set correctly.
-   **After Logout:**
    -   Check local storage to ensure all authentication-related items are cleared.
