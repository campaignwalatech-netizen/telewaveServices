import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole, selectIsLoading } from '../redux/slices/authSlice';
import Loader from '../components/Loader';

/**
 * Public Route Component - Redirects authenticated users to appropriate dashboard
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.restricted - Whether to redirect authenticated users
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const PublicRoute = ({
  children,
  restricted = true,
  fallback = <Loader />
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);

  // Show loading fallback while auth state is being determined
  if (isLoading) {
    return fallback;
  }

  // If route is restricted and user is authenticated, redirect to dashboard
  if (restricted && isAuthenticated) {
    const dashboardRoute = getDashboardRoute(userRole);
    return <Navigate to={dashboardRoute} replace />;
  }

  // Render public content
  return children;
};

/**
 * Get appropriate dashboard route based on user role
 * @param {string} userRole - Current user role
 * @returns {string} - Dashboard route
 */
const getDashboardRoute = (userRole) => {
  switch (userRole) {
    case 'admin':
      return '/admin';
    case 'user':
      return '/user';
    case 'moderator':
      return '/moderator';
    default:
      return '/';
  }
};

export default PublicRoute;