// src/pages/auth/PendingApproval.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { logoutUser } from '../../redux/slices/authSlice'; // Import the logout action
import authService from '../../services/authService';

export default function PendingApproval({ darkMode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Auto-redirect to login after 10 seconds if user manually navigates here
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Redirect if user gets approved while on this page
  useEffect(() => {
    if (user?.registrationStatus === 'approved') {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'TL') {
        navigate('/tl', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [user, navigate]);

  // Proper logout function
  const handleLogout = async () => {
    try {
      // Option 1: Use authService logout (makes API call)
      await authService.logout();
      
      // Option 2: Or manually clear all auth data
      // authService.clearAuthData();
      
      // Dispatch logout action to update Redux state
      dispatch(logoutUser());
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear data and redirect even if there's an error
      authService.clearAuthData();
      dispatch(logoutUser());
      navigate('/');
    }
  };

  // Also add a simple localStorage-only logout option
  const handleSimpleLogout = () => {
    // Clear all auth-related localStorage items
    const itemsToRemove = [
      'isLoggedIn',
      'userType',
      'accessToken',
      'refreshToken',
      'user',
      'userEmail',
      'userName',
      'token',
      'userPhone'
    ];
    
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    // Dispatch logout to clear Redux state
    dispatch(logoutUser());
    
    // Clear API authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Redirect to login
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <div
        className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 text-center ${
            darkMode
              ? 'bg-gray-700'
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-gray-600' : 'bg-white/20'
            }`}
          >
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p
            className={`mt-2 ${
              darkMode ? 'text-gray-300' : 'text-blue-100'
            }`}
          >
            Your account is under review
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Status */}
          <div className="mb-6">
            <StatusItem
              darkMode={darkMode}
              icon="✓"
              title="Registration Complete"
              text="Your account has been created successfully."
              color="green"
            />

            <StatusItem
              darkMode={darkMode}
              icon="⏳"
              title="Admin Approval Pending"
              text="Your account is awaiting admin review and approval."
              color="amber"
            />

            <StatusItem
              darkMode={darkMode}
              icon="📧"
              title="Notification"
              text="You'll receive an email once your account is approved."
              color="blue"
            />
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3
              className={`font-semibold mb-4 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              Approval Process
            </h3>
            <div className="space-y-4">
              <TimelineItem step="1" text="Account registration completed" color="green" />
              <TimelineItem step="2" text="Admin reviews your profile" color="amber" />
              <TimelineItem step="3" text="Approval notification sent" color="blue" />
              <TimelineItem step="4" text="Access full dashboard features" disabled />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition text-center"
            >
              Return to Login
            </Link>

            {/* Logout Button - Use proper logout */}
            <button
              onClick={handleLogout}
              className={`w-full font-semibold py-3 px-4 rounded-lg border transition ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Logout
            </button>

            {/* Alternative simple logout button (if needed) */}
            <button
              onClick={handleSimpleLogout}
              className={`w-full font-semibold py-2 px-4 rounded-lg text-sm ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clear Session & Logout
            </button>

            <p
              className={`text-xs text-center pt-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Need assistance? Contact support at
              <a
                href="mailto:support@freelancerwala.com"
                className="text-blue-400 hover:underline ml-1"
              >
                support@freelancerwala.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================
   Helper Components (unchanged)
============================ */

function StatusItem({ darkMode, icon, title, text, color }) {
  const colors = {
    green: darkMode
      ? 'bg-green-900/50 text-green-300'
      : 'bg-green-100 text-green-600',
    amber: darkMode
      ? 'bg-amber-900/50 text-amber-300'
      : 'bg-amber-100 text-amber-600',
    blue: darkMode
      ? 'bg-blue-900/50 text-blue-300'
      : 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="flex items-start mb-4">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${colors[color]}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {title}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({ step, text, color, disabled }) {
  const colors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-center">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mr-3 ${
          disabled ? 'bg-gray-300 text-gray-600' : colors[color]
        }`}
      >
        {step}
      </div>
      <span className={disabled ? 'text-gray-500' : 'text-gray-700'}>
        {text}
      </span>
    </div>
  );
}