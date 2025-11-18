import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '../../redux/slices/authSlice';
import { DEFAULT_REDIRECTS } from '../../routes/routeConstants';
import Button from '../../components/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleGoHome = () => {
    const homeRoute = isAuthenticated 
      ? DEFAULT_REDIRECTS[userRole] || DEFAULT_REDIRECTS.guest
      : DEFAULT_REDIRECTS.guest;
    navigate(homeRoute);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-10 h-10 text-blue-600 dark:text-blue-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.563M15 9.34V7a3 3 0 00-3-3 3 3 0 00-3 3v2.34M4 18v-2a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Home
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
            Lost? Try using the navigation menu or search.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;