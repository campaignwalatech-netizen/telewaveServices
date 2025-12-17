# Manual Test Cases for Footer

**Component:** `src/userDashboard/components/Footer.jsx`

**Objective:** To verify the correct rendering and appearance of the footer component.

---

### Test Case 1: Render the Footer

| Test Case ID | TC_FOOTER_01                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the footer renders with all its links and text. |
| **Steps**      | 1. Navigate to any page in the user dashboard that includes the main layout. |
| **Expected Result** | The footer should be visible at the bottom of the page, containing:<br>- Links for "Contact Us", "Company", and "Privacy Policy".<br>- Social media icons.<br>- A copyright notice (e.g., "© Freelancewala by codessy"). |

---

### Test Case 2: Link Functionality

| Test Case ID | TC_FOOTER_02                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the links in the footer are present. |
| **Steps**      | 1. Click on each link in the footer ("Contact Us", "Company", "Privacy Policy", and social icons). |
| **Expected Result** | Each link should have a `href="#"` attribute, meaning they will not navigate away from the page but are correctly rendered as anchor tags. |

---

### Test Case 3: Dark Mode Rendering

| Test Case ID | TC_FOOTER_03                                       |
|--------------|----------------------------------------------------|
| **Description**  | Verify that the footer displays correctly in dark mode. |
| **Prerequisites** | The `darkMode` prop is set to `true`. |
| **Steps**      | 1. Enable dark mode on the dashboard.<br>2. Observe the footer's appearance. |
| **Expected Result** | The footer should have a dark background color and light text color, consistent with the dark theme. All elements should be clearly visible. |
