// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
  selectIsLoading,
  selectUser,
} from "../redux/slices/authSlice";
import Loader from "../components/Loader";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/",
  requireAuth = true,
  fallback = <Loader />,
}) => {
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser); // Get user data

  if (isLoading) return fallback;

  // Authentication required but user not logged in
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check if non-admin user is approved
  if (requireAuth && isAuthenticated && user) {
    if (user.role !== 'admin' && user.status !== 'approved') {
      // Redirect to pending approval page
      return (
        <Navigate
          to="/pending-approval"
          state={{ from: location.pathname }}
          replace
        />
      );
    }
  }

  // Role-based check
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to={getRoleRedirect(userRole)}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
};

const getRoleRedirect = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "user":
      return "/user";
    case "moderator":
      return "/moderator";
    default:
      return "/unauthorized";
  }
};

export default ProtectedRoute;