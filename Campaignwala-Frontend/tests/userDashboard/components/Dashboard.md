# Manual Test Cases for Dashboard Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **D-1** | **Verify component rendering** | 1. Navigate to the user dashboard. | The `Dashboard` component should render with a welcome message, stats cards, and a list of product categories. | |
| **D-2** | **Verify loading state** | 1. While the categories are loading, observe the UI. | A loading spinner should be displayed in the product cards section. | |
| **D-3** | **Verify stats card navigation** | 1. Click on the "Current Balance" card. 2. Click on the "Total Earnings" card. | 1. The user should be navigated to the `/user/wallet-withdrawl` page. 2. The user should be navigated to the `/user/total-balance` page. | |
| **D-4** | **Verify category card navigation** | 1. Click on any of the category cards. | The user should be navigated to the corresponding category offers page (e.g., `/user/category-offers/category-id`). | |
| **D-5** | **Verify fallback data** | 1. Simulate a scenario where the API fails to fetch categories. | The dashboard should display a set of fallback product cards. | |
| **D-6** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme with appropriate colors. | |
| **D-7** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme with appropriate colors. | |