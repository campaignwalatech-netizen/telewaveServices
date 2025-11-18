
# Test Cases for Modal Components

**Component:** `src/adminDashboard/components/Modals.jsx`

---

### 1. DeleteModal

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| MOD-DEL-001 | It should not be visible when `isOpen` is false. | 1. Render the `DeleteModal` with `isOpen={false}`. | The modal should not be rendered in the DOM. |
| MOD-DEL-002 | It should be visible when `isOpen` is true. | 1. Render the `DeleteModal` with `isOpen={true}`. | The modal should appear with the title "Confirm Delete", a message, and "Delete" and "Cancel" buttons. |
| MOD-DEL-003 | It should display the correct item name. | 1. Render with `isOpen={true}` and `itemName="Test Item"`. | The message should read: "Are you sure you want to delete **Test Item**?". |
| MOD-DEL-004 | It should call `onClose` when the close button is clicked. | 1. Render with `isOpen={true}` and a mock `onClose` function. <br> 2. Click the `X` button. | The `onClose` function should be called once. |
| MOD-DEL-005 | It should call `onClose` when the "Cancel" button is clicked. | 1. Render with `isOpen={true}` and a mock `onClose` function. <br> 2. Click the "Cancel" button. | The `onClose` function should be called once. |
| MOD-DEL-006 | It should call `onConfirm` when the "Delete" button is clicked. | 1. Render with `isOpen={true}` and a mock `onConfirm` function. <br> 2. Click the "Delete" button. | The `onConfirm` function should be called once. |

---

### 2. EditModal

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| MOD-EDIT-001 | It should not be visible when `isOpen` is false. | 1. Render the `EditModal` with `isOpen={false}`. | The modal should not be rendered. |
| MOD-EDIT-002 | It should display with the correct title and children. | 1. Render with `isOpen={true}`, `title="Edit User"`, and some child elements. | The modal should appear with the title "Edit User", the provided child content, and "Save Changes" and "Cancel" buttons. |
| MOD-EDIT-003 | It should call `onClose` when the close (`X`) or "Cancel" button is clicked. | 1. Render with `isOpen={true}` and a mock `onClose`. <br> 2. Click the `X` button, then repeat and click the "Cancel" button. | The `onClose` function should be called on each click. |
| MOD-EDIT-004 | It should call `onConfirm` when the "Save Changes" button is clicked. | 1. Render with `isOpen={true}` and a mock `onConfirm`. <br> 2. Click "Save Changes". | The `onConfirm` function should be called once. |

---

### 3. ConfirmModal

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| MOD-CONF-001 | It should not be visible when `isOpen` is false. | 1. Render the `ConfirmModal` with `isOpen={false}`. | The modal should not be rendered. |
| MOD-CONF-002 | It should display with the correct title and message. | 1. Render with `isOpen={true}`, `title="Confirm Action"`, and `message="Please confirm."`. | The modal should appear with the specified title and message. |
| MOD-CONF-003 | It should display the correct confirmation text on the button. | 1. Render with `isOpen={true}` and `confirmText="Proceed"`. | The confirmation button should have the text "Proceed". |
| MOD-CONF-004 | It should apply the correct color style to the confirm button. | 1. Render with `isOpen={true}` and `confirmColor="green"`. | The confirmation button should have the green background color class (`bg-green-600`). |
| MOD-CONF-005 | It should call `onClose` and `onConfirm` correctly. | 1. Render with mocks for `onClose` and `onConfirm`. <br> 2. Click the confirm button, then the cancel button. | `onConfirm` should be called on the first click, and `onClose` on the second. |

---
