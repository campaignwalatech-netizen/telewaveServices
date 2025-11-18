
# Manual Test Scenarios for ZeroFreeDemat.jsx

## 1. Data Fetching and Loading

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ZFD-001 | Verify loading state | 1. Navigate to the ZeroFeeDemat page. <br> 2. Observe the initial state before data is fetched. | A loading spinner and the text "Loading offer details..." should be displayed. |
| ZFD-002 | Fetch offer with a specific ID | 1. Navigate to the page with a valid `offerId` in the URL (e.g., `/demat/offer/123`). | The details of the offer with ID `123` should be fetched and displayed correctly. |
| ZFD-003 | Fetch first DEMAT offer without an ID | 1. Navigate to the page without an `offerId` in the URL (e.g., `/demat/offer`). | The component should fetch all offers and display the details of the first offer categorized as "DEMAT". |
| ZFD-004 | API failure when fetching offer | 1. Navigate to the page. <br> 2. Simulate an API error when the component tries to fetch offer details. | The loading spinner should disappear, and the component should display its default hardcoded text for offer details. No error should crash the page. |
| ZFD-005 | No DEMAT offer found | 1. Navigate to the page without an `offerId`. <br> 2. Ensure no offers are categorized as "DEMAT" in the backend. | The loading spinner should disappear, and the component should display its default hardcoded text. |

## 2. UI and Content Display

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ZFD-006 | Verify offer details display | 1. Ensure an offer is successfully fetched. <br> 2. Check the displayed content. | The offer's name, earning structure (commissions), and terms and conditions should be displayed as returned by the API. |
| ZFD-007 | Verify default content display | 1. Ensure no offer is fetched (e.g., due to API error or no offer found). <br> 2. Check the displayed content. | The component should display the default hardcoded text for the title, earning structure, and terms. |
| ZFD-008 | Verify UI in Light Mode | 1. Set the `darkMode` prop to `false`. <br> 2. Observe the component's appearance. | The component should have a light background (e.g., `bg-gray-50`) and dark text. |
| ZFD-009 | Verify UI in Dark Mode | 1. Set the `darkMode` prop to `true`. <br> 2. Observe the component's appearance. | The component should have a dark background (e.g., `bg-gray-900`) and light text. |

## 3. Copy Link Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| ZFD-010 | Copy link for a logged-in user | 1. Log in to the application. <br> 2. Navigate to the ZeroFeeDemat page. <br> 3. Click the "Copy Link" button. | An alert "Link copied to clipboard!" should appear. The clipboard should contain the correct shareable link (e.g., `.../share/{offerId}/{userId}`). |
| ZFD-011 | Attempt to copy link when logged out | 1. Log out of the application. <br> 2. Navigate to the ZeroFeeDemat page. <br> 3. Click the "Copy Link" button. | An alert "Please login to generate your share link." should appear. The clipboard should not be modified. |
| ZFD-012 | Verify link format | 1. Log in and navigate to the page. <br> 2. Inspect the value of the trackable link input field. | The link should be in the format: `{window.location.origin}/share/{offer._id}/{user._id}`. |
