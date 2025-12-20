import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUserRole, 
  selectIsLoading,
  selectUser 
} from '../redux/slices/authSlice';
import Loader from '../components/Loader';
import authService from '../services/authService';

/**
 * Role-based Route Component with Registration Status Check
 * Restricts access based on user role AND registration status
 */
const RoleBasedRoute = ({
  children,
  role, // Expected role: 'admin', 'user', or 'TL'
  requireApproval = true, // Whether to check registration status (true for users/TLs, false for admin)
  redirectTo = '/',
  fallback = <Loader />
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);

  // Show loading fallback while auth state is being determined
  if (isLoading) {
    return fallback;
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (userRole !== role) {
    // Redirect to appropriate dashboard based on user role
    let dashboardRoute = '/';
    switch (userRole) {
      case 'admin':
        dashboardRoute = '/admin';
        break;
      case 'TL':
        dashboardRoute = '/tl';
        break;
      case 'user':
        dashboardRoute = '/user';
        break;
      default:
        dashboardRoute = '/';
    }
    
    return (
      <Navigate 
        to={dashboardRoute} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check registration status for non-admin users using authService
  if (requireApproval && userRole !== 'admin') {
    if (!authService.isUserApproved()) {
      console.log(`⚠️ User is not approved (status: ${authService.getUserRegistrationStatus()}), redirecting to pending approval`);
      return (
        <Navigate 
          to="/pending-approval" 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
  }

  // All checks passed, render the protected content
  return children;
};

export default RoleBasedRoute;