import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole, selectIsLoading } from '../redux/slices/authSlice';
import Loader from '../components/Loader';

/**
 * Role-based Route Component
 * Restricts access based on user role
 */
const RoleBasedRoute = ({
  children,
  role, // Expected role: 'admin', 'user', or 'TL'
  redirectTo = '/',
  fallback = <Loader />
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);

  // Debug logs
  console.log('RoleBasedRoute Debug:', {
    path: location.pathname,
    isAuthenticated,
    userRole,
    expectedRole: role,
    isLoading
  });

  // Show loading fallback while auth state is being determined
  if (isLoading) {
    console.log('Showing loader...');
    return fallback;
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to:', redirectTo);
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
    console.log(`Role mismatch: User has role "${userRole}", expected "${role}"`);
    
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
    
    console.log('Redirecting to dashboard:', dashboardRoute);
    return (
      <Navigate 
        to={dashboardRoute} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  console.log('All checks passed, rendering children');
  // All checks passed, render the protected content
  return children;
};

export default RoleBasedRoute;