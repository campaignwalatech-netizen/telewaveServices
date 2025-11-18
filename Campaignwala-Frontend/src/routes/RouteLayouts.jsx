import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

/**
 * Layout wrapper for admin routes
 */
const AdminRouteLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/unauthorized">
      <Outlet />
    </ProtectedRoute>
  );
};

/**
 * Layout wrapper for user routes
 */
const UserRouteLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['user']} redirectTo="/unauthorized">
      <Outlet />
    </ProtectedRoute>
  );
};

/**
 * Layout wrapper for moderator routes
 */
const ModeratorRouteLayout = () => {
  return (
    <ProtectedRoute allowedRoles={['moderator']} redirectTo="/unauthorized">
      <Outlet />
    </ProtectedRoute>
  );
};

/**
 * Layout wrapper for authenticated routes (any role)
 */
const AuthenticatedRouteLayout = () => {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/">
      <Outlet />
    </ProtectedRoute>
  );
};

export {
  AdminRouteLayout,
  UserRouteLayout,
  ModeratorRouteLayout,
  AuthenticatedRouteLayout
};