
# Test Cases for Button Component

**Component:** `src/components/Button.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| BTN-001 | It should render a default primary button. | 1. Render the component with default props and some text content like "Click me". | A button with primary styles, medium size, and the text "Click me" should be visible. |
| BTN-002 | It should render a button with specified children. | 1. Render the component with a `<span>` or other HTML element as a child. | The button should display the rendered HTML content. |

---

### 2. Variants

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| BTN-003 | It should apply primary variant styles. | 1. Render the component with `variant="primary"`. | The button should have the CSS classes for the primary variant (`bg-blue-600`, `text-white`, etc.). |
| BTN-004 | It should apply secondary variant styles. | 1. Render the component with `variant="secondary"`. | The button should have the CSS classes for the secondary variant (`bg-gray-600`, `text-white`, etc.). |
| BTN-005 | It should apply outline variant styles. | 1. Render the component with `variant="outline"`. | The button should have the CSS classes for the outline variant (`border`, `border-gray-300`, etc.). |
| BTN-006 | It should apply danger variant styles. | 1. Render the component with `variant="danger"`. | The button should have the CSS classes for the danger variant (`bg-red-600`, `text-white`, etc.). |
| BTN-007 | It should apply success variant styles. | 1. Render the component with `variant="success"`. | The button should have the CSS classes for the success variant (`bg-green-600`, `text-white`, etc.). |

---

### 3. Sizes

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| BTN-008 | It should apply small size styles. | 1. Render the component with `size="sm"`. | The button should have the CSS classes for the small size (`px-3`, `py-1.5`, `text-sm`). |
| BTN-009 | It should apply medium size styles. | 1. Render the component with `size="md"`. | The button should have the CSS classes for the medium size (`px-4`, `py-2`, `text-base`). |
| BTN-010 | It should apply large size styles. | 1. Render the component with `size="lg"`. | The button should have the CSS classes for the large size (`px-6`, `py-3`, `text-lg`). |

---

### 4. States

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| BTN-011 | It should be disabled. | 1. Render the component with the `disabled` prop set to `true`. | The button should have the `disabled` attribute and appear visually disabled (e.g., with reduced opacity). It should not be clickable. |
| BTN-012 | It should show a loading indicator. | 1. Render the component with the `loading` prop set to `true`. | The button should be disabled and display a spinning SVG icon. The button's text should still be visible. |
| BTN-013 | It should not be clickable when loading. | 1. Render the component with `loading={true}` and an `onClick` handler. <br> 2. Click the button. | The `onClick` handler should not be called. |

---

### 5. Functionality

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| BTN-014 | It should handle click events. | 1. Render the component with an `onClick` handler. <br> 2. Click the button. | The `onClick` handler should be called once. |
| BTN-015 | It should not handle click events when disabled. | 1. Render the component with `disabled={true}` and an `onClick` handler. <br> 2. Click the button. | The `onClick` handler should not be called. |
| BTN-016 | It should pass through additional props. | 1. Render the component with an extra HTML attribute, e.g., `aria-label="Custom Label"`. | The button element in the DOM should have the `aria-label` attribute with the value "Custom Label". |
| BTN-017 | It should accept a custom `className`. | 1. Render the component with a `className` prop, e.g., `className="my-custom-class"`. | The button should have "my-custom-class" in its class list, in addition to its default classes. |
| BTN-018 | It should have a `type` attribute. | 1. Render the component with `type="submit"`. | The button element in the DOM should have `type="submit"`. |

---
