
# Manual Test Plan for adminDashboard index

## Objective
To ensure that the `index.js` file in `src/adminDashboard` correctly exports all the necessary pages and components.

## Test Cases

### 1. Verify Exports
-   **Steps:**
    1.  In a test component or another part of the application, import one or more of the exported components from `src/adminDashboard`.
    ```javascript
    import { DashboardPage, AdminSidebar } from './path/to/src/adminDashboard';
    ```
    2.  Try to use the imported components in your application code.
-   **Expected Result:**
    -   All components should be imported successfully without any errors.
    -   The application should compile and run without any issues related to these imports.
