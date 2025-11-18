
# Manual Test Scenarios for profile.jsx (ProfileOverview)

## 1. UI and Content Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PO-001 | Verify user information | 1. Navigate to the profile page. <br> 2. Observe the user information section. | The user's avatar, name ("John Doe"), email, and phone number should be displayed correctly. |
| PO-002 | Verify KYC status display | 1. Navigate to the profile page. <br> 2. Observe the KYC section. | The status "Pending Review by Admin" should be displayed in a colored badge. The "Update Profile / KYC" button should be visible. |
| PO-003 | Verify Campaign Waala Card | 1. Navigate to the profile page. <br> 2. Scroll down to the card section. | The title "YOUR CAMPAIGN WAALA CARD", a description, and a GIF of the card should be visible. |
| PO-004 | Verify UI in Light Mode | 1. Ensure the `darkMode` prop is `false`. <br> 2. Observe the component's appearance. | The component should have a light background (e.g., `bg-gray-50`) and dark text. |
| PO-005 | Verify UI in Dark Mode | 1. Ensure the `darkMode` prop is `true`. <br> 2. Observe the component's appearance. | The component should have a dark background (e.g., `bg-gray-900`) and light text. |

## 2. Navigation

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| PO-006 | "Update Profile / KYC" button navigation | 1. Navigate to the profile page. <br> 2. Click the "Update Profile / KYC" button. | The user should be redirected to the `/user/kyc-details` page. |
