/**
 * Application Route Constants
 * Centralized route definitions for better maintainability
 */

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password'
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  Offers: '/admin/Offers',
  USERS: '/admin/users',
  CATEGORIES: '/admin/categories',
  LEADS: '/admin/leads',
  SLIDES: '/admin/slides',
  PAYMENTS: '/admin/payments',
  ANALYTICS: '/admin/analytics',
  LOGS: '/admin/logs',
  SETTINGS: '/admin/settings',
  PROFILE: '/admin/profile'
};

// User Routes
export const USER_ROUTES = {
  DASHBOARD: '/user',
  PROFILE: '/user/profile',
  ACCOUNT_LINK: '/user/account-link',
  ATTENDANCE: '/user/attendance',
  LEADS: '/user/leads',
  TODAYS_LEADS: '/user/todays-leads',
  PREVIOUS_LEADS: '/user/previous-leads',
  CLOSED_LEADS: '/user/closed-leads',
  ANALYTICS: '/user/analytics',
  LEADERBOARD: '/user/leaderboard',
  ANNOUNCEMENTS: '/user/announcements',
  FAQ: '/user/faq',
  SALARY: '/user/salary',
  LIVE_TOPPERS: '/user/live-toppers',
  MONTHLY_WINNERS: '/user/monthly-winners',
  ACCOUNTS: {
    PENDING: '/user/pending-account',
    APPROVED: '/user/approved-account',
    COMPLETED: '/user/completed-account'
  }
};

// Error Routes
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/500'
};

// Route Patterns for dynamic matching
export const ROUTE_PATTERNS = {
  ADMIN: '/admin/*',
  USER: '/user/*',
  AUTH: '/auth/*'
};

// Default redirects based on user role
export const DEFAULT_REDIRECTS = {
  admin: ADMIN_ROUTES.DASHBOARD,
  user: USER_ROUTES.DASHBOARD,
  moderator: '/moderator/dashboard',
  guest: PUBLIC_ROUTES.LOGIN
};

// Protected route configurations
export const ROUTE_CONFIG = {
  PUBLIC: {
    requireAuth: false,
    allowedRoles: [],
    restricted: true // Redirect authenticated users
  },
  PROTECTED: {
    requireAuth: true,
    allowedRoles: ['admin', 'user', 'moderator'],
    restricted: false
  },
  ADMIN_ONLY: {
    requireAuth: true,
    allowedRoles: ['admin'],
    restricted: false
  },
  USER_ONLY: {
    requireAuth: true,
    allowedRoles: ['user'],
    restricted: false
  },
  MODERATOR_ONLY: {
    requireAuth: true,
    allowedRoles: ['moderator'],
    restricted: false
  }
};

// Navigation menu structure
export const NAVIGATION_MENU = {
  ADMIN: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: ADMIN_ROUTES.DASHBOARD,
      icon: 'dashboard'
    },
    {
      key: 'manage-account',
      label: 'Manage Account',
      icon: 'account',
      children: [
        { key: 'all-Offers', label: 'All Offers', path: '/admin/Offers/all' },
        { key: 'add-Offers', label: 'Add Offers', path: '/admin/Offers/add' },
        { key: 'approve-Offers', label: 'Approve Offers', path: '/admin/Offers/approve' }
      ]
    },
    {
      key: 'manage-category',
      label: 'Manage Category',
      icon: 'category',
      children: [
        { key: 'all-categories', label: 'All Categories', path: '/admin/categories/all' },
        { key: 'add-category', label: 'Add Category', path: '/admin/categories/add' }
      ]
    },
    {
      key: 'leads',
      label: 'Leads',
      icon: 'leads',
      children: [
        { key: 'abc-analytics', label: 'ABC Analytics', path: '/admin/leads/analytics' },
        { key: 'leads-pending', label: 'Pending Leads', path: '/admin/leads/pending' },
        { key: 'leads-approved', label: 'Approved Leads', path: '/admin/leads/approved' },
        { key: 'leads-completed', label: 'Completed Leads', path: '/admin/leads/completed' },
        { key: 'leads-rejected', label: 'Rejected Leads', path: '/admin/leads/rejected' }
      ]
    },
    {
      key: 'user-management',
      label: 'User Management',
      icon: 'users',
      children: [
        { key: 'all-active-users', label: 'Active Users', path: '/admin/users/active' },
        { key: 'all-hold-users', label: 'Hold Users', path: '/admin/users/hold' },
        { key: 'all-ex-users', label: 'Ex Users', path: '/admin/users/ex' }
      ]
    },
    {
      key: 'slideboard',
      label: 'Slide Board',
      icon: 'slides',
      children: [
        { key: 'all-slides', label: 'All Slides', path: '/admin/slides/all' },
        { key: 'add-slide', label: 'Add Slide', path: '/admin/slides/add' }
      ]
    },
    {
      key: 'payment-withdrawal',
      label: 'Payment Withdrawal',
      path: ADMIN_ROUTES.PAYMENTS,
      icon: 'payment'
    },
    {
      key: 'miscellaneous',
      label: 'Miscellaneous',
      icon: 'misc',
      children: [
        { key: 'reset-password', label: 'Reset Password', path: '/admin/misc/reset-password' },
        { key: 'admin-logs', label: 'Admin Logs', path: '/admin/misc/logs' },
        { key: 'user-queries', label: 'User Queries', path: '/admin/misc/queries' }
      ]
    }
  ],
  
  USER: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      path: USER_ROUTES.DASHBOARD,
      icon: 'dashboard'
    },
    {
      key: 'profile',
      label: 'Profile',
      path: USER_ROUTES.PROFILE,
      icon: 'profile'
    },
    {
      key: 'account-link',
      label: 'Account Link',
      path: USER_ROUTES.ACCOUNT_LINK,
      icon: 'link'
    },
    {
      key: 'attendance',
      label: 'Attendance',
      path: USER_ROUTES.ATTENDANCE,
      icon: 'attendance'
    },
    {
      key: 'leads',
      label: 'Leads',
      icon: 'leads',
      children: [
        { key: 'todays-leads', label: "Today's Leads", path: USER_ROUTES.TODAYS_LEADS },
        { key: 'previous-leads', label: 'Previous Leads', path: USER_ROUTES.PREVIOUS_LEADS },
        { key: 'closed-leads', label: 'Closed Leads', path: USER_ROUTES.CLOSED_LEADS }
      ]
    },
    {
      key: 'analytics',
      label: 'Work Analytics',
      path: USER_ROUTES.ANALYTICS,
      icon: 'analytics'
    },
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      path: USER_ROUTES.LEADERBOARD,
      icon: 'leaderboard'
    },
    {
      key: 'announcements',
      label: 'Announcements',
      path: USER_ROUTES.ANNOUNCEMENTS,
      icon: 'announcements'
    },
    {
      key: 'salary',
      label: 'Salary Received',
      path: USER_ROUTES.SALARY,
      icon: 'salary'
    }
  ]
};

export default {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  USER_ROUTES,
  ERROR_ROUTES,
  ROUTE_PATTERNS,
  DEFAULT_REDIRECTS,
  ROUTE_CONFIG,
  NAVIGATION_MENU
};