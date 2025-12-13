// src/pages/auth/PendingApproval.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PendingApproval({ darkMode }) {
  const navigate = useNavigate();

  // Auto-redirect to login after 10 seconds if user manually navigates here
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 50000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-6 text-center ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-white/20'}`}>
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-blue-100'}`}>Your registration was successful!</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-start mb-4">
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <span className={`text-lg ${darkMode ? 'text-green-300' : 'text-green-600'}`}>✓</span>
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Registration Complete</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your account has been created successfully.</p>
              </div>
            </div>

            <div className="flex items-start mb-4">
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                <span className={`text-lg ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>⏳</span>
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Admin Approval Pending</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your account is awaiting admin review and approval.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <span className={`text-lg ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>📧</span>
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notification</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You'll receive an email once your account is approved.</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Approval Process</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-3">
                  1
                </div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Account registration completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs mr-3">
                  2
                </div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Admin reviews your profile</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-3">
                  3
                </div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Approval notification sent</span>
              </div>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'}`}>
                  4
                </div>
                <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Access full dashboard features</span>
              </div>
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
            
            <p className={`text-xs text-center pt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Need assistance? Contact support at 
              <a href="mailto:support@campaignwaala.com" className="text-blue-400 hover:underline ml-1">
                support@campaignwaala.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}