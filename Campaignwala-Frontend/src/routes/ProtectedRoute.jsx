import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole, selectIsLoading } from '../redux/slices/authSlice';
import Loader from '../components/Loader';

/**
 * Protected Route Component with Role-based Access Control
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect unauthorized users
 * @param {boolean} props.requireAuth - Whether authentication is required
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = '/',
  requireAuth = true,
  fallback = <Loader />
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);

  // Show loading fallback while auth state is being determined
  if (isLoading) {
    return fallback;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with the attempted location
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to unauthorized page or appropriate route based on user role
    const unauthorizedRedirect = getUserRoleRedirect(userRole);
    return (
      <Navigate 
        to={unauthorizedRedirect} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // All checks passed, render the protected content
  return children;
};

/**
 * Get appropriate redirect path based on user role
 * @param {string} userRole - Current user role
 * @returns {string} - Redirect path
 */
const getUserRoleRedirect = (userRole) => {
  switch (userRole) {
    case 'admin':
      return '/admin';
    case 'user':
      return '/user';
    case 'moderator':
      return '/moderator';
    default:
      return '/unauthorized';
  }
};

export default ProtectedRoute;