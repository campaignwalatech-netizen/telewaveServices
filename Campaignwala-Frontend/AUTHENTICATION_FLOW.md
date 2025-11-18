# Authentication Flow

## Current Setup

### Login Credentials:

**Admin Login:**
- Email: admin@test.com
- Password: admin123
- Redirects to: `/admin/dashboard`

**User Login:**
- Email: user@test.com  
- Password: user123
- Redirects to: `/user/dashboard`

### Registration Flow:

**User Registration:**
- Fill registration form with name, email, phone, password
- Auto-redirects to user dashboard (`/user/dashboard`)
- All new registrations create user role accounts
- No admin registration through UI

### Flow:
1. **Login:** User enters credentials → Redux validation → Role-based redirect
2. **Register:** User fills form → Creates user account → Auto-login → User dashboard
3. **Admin:** Only through predefined credentials (admin@test.com/admin123)
4. **User:** Can login with user@test.com/user123 OR register new account

### No OTP Required:
- Direct login without OTP verification
- Direct registration without OTP verification
- Credentials validated in authSlice
- Automatic redirection based on user role

### Testing:
1. **Login:** Go to http://localhost:5175/ → Enter credentials
2. **Register:** Go to http://localhost:5175/register → Fill form → Auto-login to user dashboard
3. **Admin Access:** Only through admin@test.com/admin123
4. **User Access:** Through user@test.com/user123 OR new registration