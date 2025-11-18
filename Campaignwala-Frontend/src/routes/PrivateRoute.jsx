import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUserRole, 
  selectHasPermission,
  selectIsLoading 
} from '../redux/slices/authSlice';
import Loader from '../components/Loader';

/**
 * Private Route Component - Requires authentication and specific permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Array<string>} props.requiredPermissions - Array of required permissions
 * @param {string} props.redirectTo - Path to redirect unauthorized users
 * @param {React.ReactNode} props.fallback - Component to show while loading
 */
const PrivateRoute = ({
  children,
  requiredPermissions = [],
  redirectTo = '/unauthorized',
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

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => {
      const hasPermission = useSelector(selectHasPermission(permission));
      return hasPermission;
    });

    if (!hasAllPermissions) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // All checks passed, render the private content
  return children;
};

export default PrivateRoute;