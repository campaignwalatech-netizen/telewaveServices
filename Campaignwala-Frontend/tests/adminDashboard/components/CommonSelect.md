# Manual Test Cases for CommonSelect Component

**Component:** `CommonSelect.jsx`

## Objective
To ensure the `CommonSelect` component renders correctly, handles user interactions as expected, and displays data properly under various conditions.

## Test Environment
-   **Browser:** Chrome, Firefox, Edge (Latest Versions)
-   **Device:** Desktop

---

### Test Case 1: Basic Rendering

| Test Case ID | TC_CS_01                                                    |
| :----------- | :---------------------------------------------------------- |
| **Description**  | Verify the select component renders with a label and placeholder. |
| **Steps**        | 1. Render the component with a `label` and `placeholder` prop. |
| **Expected Result** | - The label text is visible above the select input.<br>- The select input shows the placeholder text. |

---

### Test Case 2: Options Rendering (String Array)

| Test Case ID | TC_CS_02                                                              |
| :----------- | :-------------------------------------------------------------------- |
| **Description**  | Verify the component correctly displays options from a simple string array. |
| **Steps**        | 1. Render the component with an `options` prop (e.g., `['Option 1', 'Option 2']`).<br>2. Click the select trigger to open the dropdown. |
| **Expected Result** | - The dropdown opens.<br>- All options from the array are listed and visible. |

---

### Test Case 3: Options Rendering (Object Array)

| Test Case ID | TC_CS_03                                                              |
| :----------- | :-------------------------------------------------------------------- |
| **Description**  | Verify the component correctly displays options from an array of objects (`{value, label}`). |
| **Steps**        | 1. Render the component with an `options` prop (e.g., `[{value: 'opt1', label: 'Option 1'}]`).<br>2. Click the select trigger to open the dropdown. |
| **Expected Result** | - The dropdown opens.<br>- The `label` of each object is displayed for each option. |

---

### Test Case 4: Handle `onChange` Event

| Test Case ID | TC_CS_04                                                              |
| :----------- | :-------------------------------------------------------------------- |
| **Description**  | Verify the `onChange` callback is fired with the correct value when an option is selected. |
| **Steps**        | 1. Render the component with an `onChange` handler.<br>2. Open the dropdown.<br>3. Click on an option. |
| **Expected Result** | - The `onChange` function is called exactly once.<br>- The function is called with the `value` of the selected option. |

---

### Test Case 5: Controlled Value

| Test Case ID | TC_CS_05                                                              |
| :----------- | :-------------------------------------------------------------------- |
| **Description**  | Verify the component displays the correct selected value passed via the `value` prop. |
| **Steps**        | 1. Render the component with a `value` prop that matches one of the option values. |
| **Expected Result** | - The select trigger displays the `label` corresponding to the provided `value`. |

---

### Test Case 6: No Label

| Test Case ID | TC_CS_06                                                    |
| :----------- | :---------------------------------------------------------- |
| **Description**  | Verify the component renders correctly when no `label` is provided. |
| **Steps**        | 1. Render the component without the `label` prop.           |
| **Expected Result** | - The select input renders correctly.<br>- No `<label>` element is rendered. |

---

### Test Case 7: Empty Options

| Test Case ID | TC_CS_07                                                              |
| :----------- | :-------------------------------------------------------------------- |
| **Description**  | Verify the component's behavior when an empty array is passed as `options`. |
| **Steps**        | 1. Render the component with `options={[]}`.<br>2. Click the select trigger. |
| **Expected Result** | - The dropdown opens but contains no options.                 |

---