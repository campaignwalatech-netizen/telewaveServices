// src/routes/PrivateRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
  selectHasPermission,
  selectIsLoading,
} from "../redux/slices/authSlice";
import Loader from "../components/Loader";

const PrivateRoute = ({
  children,
  requiredPermissions = [],
  redirectTo = "/unauthorized",
  fallback = <Loader />,
}) => {
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);

  if (isLoading) return fallback;

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Permission checks
  if (requiredPermissions.length > 0) {
    const permissionsState = requiredPermissions.map((p) =>
      useSelector(selectHasPermission(p))
    );

    const hasAll = permissionsState.every((allowed) => allowed === true);

    if (!hasAll) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default PrivateRoute;
