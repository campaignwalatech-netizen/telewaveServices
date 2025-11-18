
# Manual Test Cases for WalletAndWithdrawl Component

| Test Case ID | Description | Steps to Reproduce | Expected Result | Status (Pass/Fail) |
| --- | --- | --- | --- | --- |
| **WW-1** | **Verify component rendering** | 1. Navigate to the Wallet & Withdrawal page. | The component should render with the title "Current Available Balance" and other sections. | |
| **WW-2** | **Verify wallet balance display** | 1. Observe the balance card. | The card should display the current available balance, total earned, and total withdrawn amounts. | |
| **WW-3** | **Verify withdrawal request submission** | 1. Enter a valid amount in the "Amount to Withdraw" field. 2. Click the "REQUEST WITHDRAWAL" button. | A success message should be displayed, and a new entry should appear in the withdrawal history with a "Pending" status. A receipt should be downloaded. | |
| **WW-4** | **Verify invalid withdrawal amount** | 1. Enter an invalid amount (e.g., text or zero) in the withdrawal field. 2. Click the "REQUEST WITHDRAWAL" button. | An alert or error message should be shown, and no withdrawal request should be submitted. | |
| **WW-5** | **Verify withdrawal history** | 1. Look at the "Withdrawal History" table. | The table should list past withdrawal requests with their ID, amount, date, status, reason, and a button to download a receipt. | |
| **WW-6** | **Verify receipt download** | 1. Click the "Download" button for any entry in the withdrawal history. | A PNG image of the withdrawal receipt should be downloaded. | |
| **WW-7** | **Verify dark mode** | 1. Enable dark mode. | The component should switch to a dark theme with appropriate colors. | |
| **WW-8** | **Verify light mode** | 1. Enable light mode. | The component should switch to a light theme with appropriate colors. | |
