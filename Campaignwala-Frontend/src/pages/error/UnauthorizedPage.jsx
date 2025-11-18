import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '../../redux/slices/authSlice';
import { DEFAULT_REDIRECTS } from '../../routes/routeConstants';
import Button from '../../components/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleGoToDashboard = () => {
    const dashboardRoute = isAuthenticated 
      ? DEFAULT_REDIRECTS[userRole] || DEFAULT_REDIRECTS.guest
      : DEFAULT_REDIRECTS.guest;
    navigate(dashboardRoute);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-10 h-10 text-red-600 dark:text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You don't have permission to access this resource.
          </p>
          
          {location.state?.from && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Attempted to access: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {location.state.from}
              </code>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Dashboard
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;