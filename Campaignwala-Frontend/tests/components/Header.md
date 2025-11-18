
# Test Cases for Header Component

**Component:** `src/components/Header.jsx`

---

### 1. Basic Rendering

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| HDR-001 | It should render the header with a title and campaign count. | 1. Render the `Header` component with default props. | The header should display the title "ALL CAMPAIGNS" and the text "18 active campaigns". |
| HDR-002 | It should render the theme toggle button. | 1. Render the `Header` component. | A button to toggle the theme should be visible. |
| HDR-003 | It should render the `ProfileMenu` component. | 1. Render the `Header` component. | The `ProfileMenu` component should be rendered within the header. |

---

### 2. Theme Toggling

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| HDR-004 | It should display the sun icon in dark mode. | 1. Render the component with `isDark={true}`. | The theme toggle button should show the `Sun` icon. |
| HDR-005 | It should display the moon icon in light mode. | 1. Render the component with `isDark={false}`. | The theme toggle button should show the `Moon` icon. |
| HDR-006 | It should call the theme toggle handler on click. | 1. Render the component with a mock `onThemeToggle` function. <br> 2. Click the theme toggle button. | The `onThemeToggle` function should be called once. |

---

### 3. Responsiveness

| Test Case ID | Description | Steps to Reproduce | Expected Result |
| :--- | :--- | :--- | :--- |
| HDR-007 | It should adjust the title and text size on smaller screens. | 1. Render the component. <br> 2. Resize the viewport to a small screen width (e.g., less than 640px). | The font size of the title and campaign count should be smaller, as defined by the responsive classes (`text-xl sm:text-2xl`, `text-xs sm:text-sm`). |
| HDR-008 | It should adjust spacing on smaller screens. | 1. Render the component. <br> 2. Resize the viewport to a small screen width. | The gap and padding in the header should adjust according to the responsive utility classes. |

---
