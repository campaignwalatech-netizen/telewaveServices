import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../redux/slices/authSlice';
import Loader from '../components/Loader';

/**
 * Role-based Route Component with automatic redirection
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.role - Required role for this route
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const RoleBasedRoute = ({
  children,
  role,
  fallback = <Loader />
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user has the required role
  if (userRole !== role) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = getRedirectPath(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  // Wrap in Suspense for code splitting support
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

/**
 * Get redirect path based on user role
 * @param {string} userRole - Current user role
 * @returns {string} - Redirect path
 */
const getRedirectPath = (userRole) => {
  const rolePaths = {
    admin: '/admin',
    user: '/user',
    moderator: '/moderator',
    guest: '/'
  };

  return rolePaths[userRole] || '/unauthorized';
};

export default RoleBasedRoute;