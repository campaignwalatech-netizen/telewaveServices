// src/routes/ProtectedRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
  selectIsLoading,
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
