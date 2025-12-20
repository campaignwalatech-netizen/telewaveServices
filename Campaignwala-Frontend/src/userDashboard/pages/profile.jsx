import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import authService from "../../services/authService";
import OtpModal from "../../components/OtpModal";

const ProfileOverview = ({ darkMode }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    phoneNumber: '+91 98765 43210'
  });
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [loading, setLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchKYCStatus();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        const user = response.data.data.user; // Access nested user object
        setUserData({
          name: user.name || 'User',
          email: user.email || 'N/A',
          phoneNumber: user.phoneNumber || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserData({
        name: 'Error loading',
        email: 'N/A',
        phoneNumber: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/users/kyc');
      console.log('🔍 KYC Status Response:', response.data); // Debug log
      if (response.data.success) {
        // Direct access to kycDetails, not nested in user
        const status = response.data.data?.kycDetails?.kycStatus || 'not_submitted';
        console.log('✅ KYC Status:', status); // Debug log
        setKycStatus(status);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setKycStatus('not_submitted');
    }
  };

  const getKYCStatusBadge = () => {
    const statusConfig = {
      'pending': {
        bg: darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
        text: 'Pending Review by Admin',
        icon: '⏳'
      },
      'approved': {
        bg: darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
        text: 'Verified ✓',
        icon: '✅'
      },
      'rejected': {
        bg: darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
        text: 'Rejected - Update Required',
        icon: '❌'
      },
      'not_submitted': {
        bg: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
        text: 'KYC Not Submitted',
        icon: '📝'
      }
    };

    // Dynamically return based on actual kycStatus from API
    return statusConfig[kycStatus?.toLowerCase()] || statusConfig['not_submitted'];
  };

  const handleUpdateProfileClick = async () => {
    try {
      // Send OTP to email
      setOtpError('');
      const response = await authService.sendEmailOTP('profile-update');
      
      if (response.success) {
        // Show OTP modal
        setShowOtpModal(true);
      } else {
        alert(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await authService.verifyEmailOTP(otp);
      
      if (response.success) {
        // OTP verified successfully, navigate to KYC update page
        setShowOtpModal(false);
        navigate("/user/kyc-details");
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error; // Re-throw to be handled by OtpModal
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authService.sendEmailOTP('profile-update');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error; // Re-throw to be handled by OtpModal
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-10 pb-16 px-4 sm:px-6 md:px-10 flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-10 pb-16 px-4 sm:px-6 md:px-10 transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
        Profile Settings Overview
      </h2>

      <div
        className={`rounded-2xl shadow-sm mb-6 overflow-hidden border ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className="h-24 sm:h-32 w-full"
          style={{
            background:
              "linear-gradient(135deg, #e0e0e0, #f8f8f8, #f0f0f0, #ffffff)",
          }}
        ></div>

        <div className="flex flex-col items-center -mt-10 pb-6 text-center">
          <img
            src="https://i.pravatar.cc/100"
            alt="User avatar"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md"
          />
          <h3
            className={`text-lg sm:text-xl font-semibold mt-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {userData.name}
          </h3>
          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {userData.email}
          </p>
          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {userData.phoneNumber}
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl shadow-sm border mb-6 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-indigo-100"
        }`}
      >
        <div className="text-center sm:text-left">
          <h4
            className={`text-base sm:text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            KYC Verification Status
          </h4>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
              getKYCStatusBadge().bg
            }`}
          >
            {getKYCStatusBadge().text}
          </span>
        </div>

        <button
          onClick={handleUpdateProfileClick}
          className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Update Profile / KYC
        </button>
      </div>

      <div
        className={`rounded-2xl border shadow-sm p-6 sm:p-10 text-center ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-blue-50 border-blue-200"
        }`}
      >
        <h3
          className={`text-lg sm:text-xl font-semibold mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          YOUR FREELANCER WALA CARD
        </h3>
        <p
          className={`text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Your personalized digital card for seamless earnings and exclusive
          benefits.
        </p>

        <img
          src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_card.gif"
          alt="Digital Card"
          className="w-48 sm:w-60 md:w-72 mx-auto rounded-lg shadow-md"
        />
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={userData.email}
        purpose="profile-update"
        darkMode={darkMode}
      />
    </div>
  );
};

export default ProfileOverview;
