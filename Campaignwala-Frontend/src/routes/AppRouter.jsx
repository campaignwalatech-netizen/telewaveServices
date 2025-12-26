import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import authService from '../services/authService';



// TL Dashboard imports
import TLDashboardLayout from "../tlDashboard/Components/TLDashboardLayout";
import TLDashboard from "../tlDashboard/pages/Dashboard";
import TeamManagement from "../tlDashboard/pages/TeamManagement";
import LeadsManagement from "../tlDashboard/pages/LeadsManagement";
import TLPerformance from "../tlDashboard/pages/Performance";
import TLReports from "../tlDashboard/pages/Reports";
import TLAssignments from "../tlDashboard/pages/Assignments";
import TLApprovals from "../tlDashboard/pages/Approvals";
import TLNotifications from "../tlDashboard/pages/Notifications";
import TLWallet from "../tlDashboard/pages/Wallet";
import TLQueries from "../tlDashboard/pages/Queries";
import TLSettings from "../tlDashboard/pages/Settings";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/Register";
import OtpVerification from "../pages/auth/OtpVerification";
import PendingApproval from "../pages/auth/PendingApproval";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Admin Components
import App from "../App";
import MainDashboard from "../adminDashboard/forms/Dashboard";
import AdminProfile from "../adminDashboard/pages/AdminProfile";

// Manage Account
import AllOffersTable from "../adminDashboard/forms/AllProductsTable";
import AddOffersForm from "../adminDashboard/forms/AddProjectForm";
import ApproveOffersTable from "../adminDashboard/forms/ApproveProjectTable";

// Manage Category
import AllCategoriesTable from "../adminDashboard/forms/AllCategoriesTable";
import AddCategoryForm from "../adminDashboard/forms/AddCategoryForm";

// Leads
import ABCAnalytics from "../adminDashboard/forms/ABCAnalytics";
import LeadsTable from "../adminDashboard/forms/LeadsTable";

// User Management
import AllUsers from "../adminDashboard/forms/AllUsers";
import PresentUsers from "../adminDashboard/forms/PresentUsers";
import AllTeamLeaders from "../adminDashboard/forms/AllTeamLeaders";
import UsersTable from "../adminDashboard/forms/UsersTable";

// Slide Board
import AllSlidesTable from "../adminDashboard/forms/AllSlidesTable";
import AddSlideForm from "../adminDashboard/forms/AddSlideForm";

// Payment Withdrawal
import PaymentWithdrawalTable from "../adminDashboard/forms/PaymentWithdrawalTable";

// Miscellaneous
import ResetPasswordForm from "../adminDashboard/forms/ResetPasswordForm";
import AdminLogsTable from "../adminDashboard/forms/AdminLogsTable";
import UserQueriesTable from "../adminDashboard/forms/UserQueriesTable";
import KYCReview from "../adminDashboard/forms/KYCReview";

// Notifications
import AdminDashboard from "../adminDashboard/notifications/AdminDashboard";
import IncompleteProfilePage from "../adminDashboard/notifications/IncompleteProfilePage";
import HotOffersPage from "../adminDashboard/notifications/HotOffersPage";
import HistoryPage from "../adminDashboard/notifications/HistoryPage";

// User Dashboard
import { UserDashboardLayout } from "../userDashboard/pages";
import Dashboard from "../userDashboard/components/Dashboard";
import AllLeads from "../userDashboard/pages/AllLeads";
import Wallet from "../userDashboard/pages/wallet";
import Profile from "../userDashboard/pages/profile";
import DematAccount from "../userDashboard/layouts/DematAccount";
import ZeroFeeDemat from "../userDashboard/layouts/ZeroFreeDemat";
import WalletAndWithdrawl from "../userDashboard/layouts/Wallet&Withdrawl";
import ProfileOverview from "../userDashboard/layouts/ProfileOverview";
import KYCDetails from "../userDashboard/layouts/KYCDetails";
// import TotalBalance from "../userDashboard/layouts/TotalBalance";
import NotificationsPage from "../userDashboard/layouts/NotificationPage";
import SharedOfferForm from "../userDashboard/pages/SharedOfferForm";
import UserQueryForm from "../userDashboard/pages/UserQueryForm";

// Route Components
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import Loader from "../components/Loader";
import SettingsPage from "../adminDashboard/pages/SettingsPage";

// User Data Pages
import TodayLeads from "../userDashboard/pages/TodayLeads";
import PreviousLeads from "../userDashboard/pages/PreviousLeads";
import ClosedLeads from "../userDashboard/pages/ClosedLeads";

// ==================== DATA MANAGEMENT PAGES ====================
// Admin Data Management Pages
import DataDashboard from "../adminDashboard/pages/data/DataDashboard";
import NotUsedDataPage from "../adminDashboard/pages/data/NotUsedDataPage";
import TodayAssignedDataPage from "../adminDashboard/pages/data/TodayAssignedDataPage";
import UploadDataPage from "../adminDashboard/pages/data/UploadDataPage";
import DistributeDataPage from "../adminDashboard/pages/data/DistributeDataPage";
import CalledDataPage from "../adminDashboard/pages/data/CalledDataPage";
import ClosedDataPage from "../adminDashboard/pages/data/ClosedDataPage";

// TL Data Management Pages
import TLDistributeDataPage from "../tlDashboard/pages/data/TLDistributeDataPage";
import TLDataDashboard from "../tlDashboard/pages/data/TLDataDashboard";
import TLWithdrawnDataPage from "../tlDashboard/pages/data/TLWithdrawnDataPage";
import TLDataAnalytics from "../tlDashboard/pages/data/TLDataAnalytics";

// User Data Management Pages
import UserTodayDataPage from "../userDashboard/pages/data/UserTodayDataPage";
import NotApprovedUsers from "../adminDashboard/forms/NotApprovedUsers";
import ApprovedUsers from "../adminDashboard/forms/ApprovedUsers";

/**
 * Main Application Router
 */
export default function AppRouter() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
   const [isAuthInitialized, setIsAuthInitialized] = useState(false);


   // Initialize auth from storage on app load
  useEffect(() => {
    const authData = authService.initializeAuthFromStorage();
    if (authData) {
      console.log('✅ Auth initialized from storage:', authData.user?.email);
    }
    setIsAuthInitialized(true);
    
    // Verify session periodically
    const verifySession = async () => {
      const isValid = await authService.verifySession();
      if (!isValid) {
        authService.clearAuthData();
      }
    };
    
    // Verify session every 5 minutes
    const interval = setInterval(verifySession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (!isAuthInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes - Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/pending-approval" element={<PendingApproval darkMode={darkMode} />} />

        {/* Public Share Link Route */}
        <Route
          path="/share/:offerId/:hrUserId"
          element={<SharedOfferForm darkMode={darkMode} />}
        />
        {/* Admin Dashboard Routes */}
        <Route 
          path="/admin/*" 
          element={
            <RoleBasedRoute role="admin" requireApproval={false}>
              <App />
            </RoleBasedRoute>
          }
        >
          {/* Default route - redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MainDashboard />} />

          {/* ==================== DATA MANAGEMENT ROUTES ==================== */}
          <Route
            path="data"
            element={<Navigate to="data/dashboard" replace />}
          />
          <Route path="profile" element={<AdminProfile darkMode={darkMode} setDarkMode={setDarkMode} />} /> 
          <Route path="data/dashboard" element={<DataDashboard darkMode={darkMode} setDarkMode={setDarkMode} />} /> 
          <Route path="data/distribute" element={<DistributeDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="data/not-used" element={<NotUsedDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="data/today-assigned" element={<TodayAssignedDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="data/upload" element={<UploadDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="data/called" element={<CalledDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="data/closed" element={<ClosedDataPage darkMode={darkMode} setDarkMode={setDarkMode} />} />

          {/* Manage Account routes */}
          <Route
            path="manage-account"
            element={<Navigate to="all-Offers" replace />}
          />
          <Route path="all-Offers" element={<AllOffersTable />} />
          <Route path="add-Offers" element={<AddOffersForm />} />
          <Route path="approve-Offers" element={<ApproveOffersTable />} />

          {/* Manage Category routes */}
          <Route
            path="manage-category"
            element={<Navigate to="all-categories" replace />}
          />
          <Route path="all-categories" element={<AllCategoriesTable />} />
          <Route path="add-category" element={<AddCategoryForm />} />

          {/* Leads routes */}
          <Route
            path="leads"
            element={<Navigate to="abc-analytics" replace />}
          />
          <Route path="abc-analytics" element={<ABCAnalytics />} />
          <Route
            path="leads-pending"
            element={<LeadsTable status="pending" />}
          />
          <Route
            path="leads-approved"
            element={<LeadsTable status="approved" />}
          />
          <Route
            path="leads-completed"
            element={<LeadsTable status="completed" />}
          />
          <Route
            path="leads-rejected"
            element={<LeadsTable status="rejected" />}
          />

          {/* User Management routes */}
          <Route
            path="user-management"
            element={<Navigate to="all-users" replace />}
          />
          <Route path="all-approved-users" element={<ApprovedUsers />} />
          <Route path="all-users" element={<AllUsers />} />
          <Route path="present-users" element={<PresentUsers />} />
          <Route path="all-tl" element={<AllTeamLeaders />} />
          <Route path="not-approved" element={<NotApprovedUsers />} />
          <Route
            path="all-active-users"
            element={<UsersTable userType="active" />}
          />
          <Route
            path="all-hold-users"
            element={<UsersTable userType="hold" />}
          />
          <Route path="all-ex-users" element={<UsersTable userType="ex" />} />

          {/* Slide Board routes */}
          <Route
            path="slideboard"
            element={<Navigate to="all-slides" replace />}
          />
          <Route path="all-slides" element={<AllSlidesTable />} />
          <Route path="add-slide" element={<AddSlideForm />} />

          {/* Payment Withdrawal */}
          <Route
            path="payment-withdrawal"
            element={<PaymentWithdrawalTable />}
          />

          {/* Notifications routes */}
          <Route path="notifications" element={<AdminDashboard />} />
          <Route
            path="notifications/incomplete-profile"
            element={<IncompleteProfilePage />}
          />
          <Route path="notifications/hot-offers" element={<HotOffersPage />} />
          <Route path="notifications/history" element={<HistoryPage />} />

          {/* Miscellaneous routes */}
          <Route path="miscellaneous" element={<ResetPasswordForm />} />
          <Route path="reset-password" element={<ResetPasswordForm />} />
          <Route path="admin-logs" element={<AdminLogsTable />} />
          <Route path="user-queries" element={<UserQueriesTable />} />
          <Route path="kyc-review" element={<KYCReview />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        {/* TL Dashboard Routes */}
        <Route
          path="/tl/*"
          element={
            <RoleBasedRoute role="TL" requireApproval={true}>
              <TLDashboardLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TLDashboard />} />

          {/* ==================== TL DATA MANAGEMENT ROUTES ==================== */}
          <Route path="data/dashboard" element={<TLDataDashboard />} />
          <Route path="data/distribute" element={<TLDistributeDataPage />} />
          <Route path="data/withdrawn" element={<TLWithdrawnDataPage />} />
          <Route path="data/analytics" element={<TLDataAnalytics />} />
          <Route path="teamList" element={<TeamManagement />} />
          <Route path="performance" element={<TLPerformance />} />
          <Route path="reports" element={<TLReports />} />
          <Route path="assignments" element={<TLAssignments />} />
          <Route path="approvals" element={<TLApprovals />} />
          <Route path="notifications" element={<TLNotifications />} />
          <Route path="wallet" element={<TLWallet />} />
          <Route path="queries" element={<TLQueries />} />
          <Route path="settings" element={<TLSettings />} />
        </Route>
        {/* User Dashboard */}
        <Route
          path="/user/*"
          element={
            <RoleBasedRoute role="user" requireApproval={true}>
              <UserDashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard darkMode={darkMode} />} />

          {/* ==================== USER DATA MANAGEMENT ROUTES ==================== */}
          <Route
            path="data-today"
            element={<UserTodayDataPage darkMode={darkMode} />}
          />

          {/* Legacy leads routes (for compatibility) */}
          <Route path="all-leads" element={<AllLeads darkMode={darkMode} />} />
          <Route
            path="leads-today"
            element={<TodayLeads darkMode={darkMode} />}
          />
          <Route
            path="leads-previous"
            element={<PreviousLeads darkMode={darkMode} />}
          />
          <Route
            path="leads-closed"
            element={<ClosedLeads darkMode={darkMode} />}
          />

          <Route path="wallet" element={<Wallet darkMode={darkMode} />} />
          <Route path="profile" element={<Profile darkMode={darkMode} />} />
          <Route
            path="demat-account"
            element={<DematAccount darkMode={darkMode} />}
          />
          <Route
            path="category-offers/:categoryId"
            element={<DematAccount darkMode={darkMode} />}
          />
          <Route
            path="zerofee-demat"
            element={<ZeroFeeDemat darkMode={darkMode} />}
          />
          <Route
            path="zerofee-demat/:offerId"
            element={<ZeroFeeDemat darkMode={darkMode} />}
          />
          <Route
            path="wallet-withdrawl"
            element={<WalletAndWithdrawl darkMode={darkMode} />}
          />
          <Route
            path="profile-overview"
            element={<ProfileOverview darkMode={darkMode} />}
          />
          <Route
            path="kyc-details"
            element={<KYCDetails darkMode={darkMode} />}
          />
          
          <Route
            path="notification-page"
            element={<NotificationsPage darkMode={darkMode} />}
          />
          <Route path="query" element={<UserQueryForm darkMode={darkMode} />} />
        </Route>
        {/* Fallback Route - Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
