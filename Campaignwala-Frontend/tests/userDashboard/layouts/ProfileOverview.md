
# Manual Test Cases for ProfileOverview Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **PO-1** | **Verify component rendering** | 1. Navigate to the user profile overview page. | The `ProfileOverview` component should render without any errors. | |
| **PO-2** | **Verify page title** | 1. Observe the page title. | The title "Profile Settings Overview" should be displayed. | |
| **PO-3** | **Verify user information** | 1. Check the user information section. | The user's avatar, name, email, and phone number should be displayed correctly. | |
| **PO-4** | **Verify KYC status** | 1. Look for the KYC verification status section. | The KYC status (e.g., "Pending Review by Admin") should be visible. | |
| **PO-5** | **Verify "Update Profile / KYC" button** | 1. Find the "Update Profile / KYC" button. | The button should be present and clickable. | |
| **PO-6** | **Verify navigation to KYC details** | 1. Click the "Update Profile / KYC" button. | The user should be redirected to the `/user/kyc-details` page. | |
| **PO-7** | **Verify Campaign Waala Card** | 1. Scroll down to the "YOUR CAMPAIGN WAALA CARD" section. | The card with a title, description, and image should be displayed. | |
| **PO-8** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme, with appropriate text and background colors. | |
| **PO-9** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme, with appropriate text and background colors. | |
