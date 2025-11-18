
# Manual Test Cases for ZeroFeeDemat Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **ZFD-1** | **Verify component rendering with offer ID** | 1. Navigate to the Zero-Fee Demat page with a specific offer ID in the URL (e.g., `/user/zerofee-demat/some-offer-id`). | The component should render, display a loading indicator, and then show the details of the specified offer, including the title, earning structure, and terms. | |
| **ZFD-2** | **Verify component rendering without offer ID** | 1. Navigate to the Zero-Fee Demat page without an offer ID (e.g., `/user/zerofee-demat`). | The component should fetch and display the details of the first available Demat account offer. | |
| **ZFD-3** | **Verify loading state** | 1. While the offer details are being fetched, observe the UI. | A loading spinner and the text "Loading offer details..." should be displayed. | |
| **ZFD-4** | **Verify "Copy Link" functionality** | 1. Click the "Copy Link" button. | An alert "Link copied to clipboard!" should appear, and the correct shareable link should be copied to the clipboard. | |
| **ZFD-5** | **Verify link generation for logged-in user** | 1. Ensure you are logged in. 2. Click the "Copy Link" button. | The generated link should include the user's ID. | |
| **ZFD-6** | **Verify link generation for logged-out user** | 1. Log out of the application. 2. Navigate to the page and click "Copy Link". | An alert should prompt the user to log in. | |
| **ZFD-7** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme with appropriate colors. | |
| **ZFD-8** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme with appropriate colors. | |
