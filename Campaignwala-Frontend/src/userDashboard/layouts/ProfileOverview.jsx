import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ProfileOverview = ({ darkMode }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    phoneNumber: '+91 98765 43210',
    uniqueCode: 'CW000'
  });
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchKYCStatus();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        const user = response.data.data.user;
        setUserData({
          name: user.name || 'User',
          email: user.email || 'N/A',
          phoneNumber: user.phoneNumber || 'N/A',
          uniqueCode: user.uniqueCode || generateUniqueCode()
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserData({
        name: 'Error loading',
        email: 'N/A',
        phoneNumber: 'N/A',
        uniqueCode: 'CW000'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueCode = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `CW${randomNum}`;
  };

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/users/kyc');
      console.log('🔍 KYC Status Response:', response.data);
      if (response.data.success) {
        const status = response.data.data?.kycDetails?.kycStatus || 'not_submitted';
        console.log('✅ KYC Status:', status);
        setKycStatus(status);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setKycStatus('not_submitted');
    }
  };

  const getUserInitial = () => {
    if (!userData.name || userData.name === 'Loading...' || userData.name === 'Error loading') {
      return 'U';
    }
    return userData.name.charAt(0).toUpperCase();
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

    return statusConfig[kycStatus?.toLowerCase()] || statusConfig['not_submitted'];
  };

  // Download card as image - Using domtoimage as fallback for better CSS support
  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      const cardElement = cardRef.current;
      
      if (!cardElement) {
        alert('Card element not found');
        setDownloading(false);
        return;
      }

      console.log('Starting card download...');

      // Try using dom-to-image-more for better CSS support
      try {
        const domtoimage = (await import('dom-to-image-more')).default;
        
        console.log('Using dom-to-image-more...');
        
        const blob = await domtoimage.toBlob(cardElement, {
          quality: 1,
          bgcolor: '#e0e7ff',
          width: cardElement.offsetWidth * 2,
          height: cardElement.offsetHeight * 2,
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left'
          }
        });

        console.log('Image created with dom-to-image');

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${userData.name.replace(/[^a-zA-Z0-9]/g, '_')}_CampaignWaala_Card.png`;
        link.download = fileName;
        link.href = url;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setDownloading(false);
          console.log('Download completed');
        }, 100);

      } catch (domToImageError) {
        console.log('dom-to-image failed, trying html2canvas...', domToImageError);
        
        // Fallback to html2canvas with aggressive color fixing
        const html2canvas = (await import('html2canvas')).default;
        
        console.log('Using html2canvas fallback...');
        
        // Temporarily hide gradient elements
        const style = document.createElement('style');
        style.id = 'temp-gradient-fix';
        style.innerHTML = `
          .bg-gradient-to-r, .bg-gradient-to-br, .bg-gradient-to-l,
          .bg-gradient-to-t, .bg-gradient-to-b, .bg-gradient-to-tl {
            background-image: none !important;
            background: #ddd6fe !important;
          }
          .bg-clip-text, .text-transparent {
            background: none !important;
            -webkit-background-clip: unset !important;
            background-clip: unset !important;
            -webkit-text-fill-color: #6366f1 !important;
            color: #6366f1 !important;
          }
        `;
        document.head.appendChild(style);

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(cardElement, {
          backgroundColor: '#e0e7ff',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });

        // Remove temporary style
        document.head.removeChild(style);

        console.log('Canvas created with html2canvas');

        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create image. Please try again.');
            setDownloading(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `${userData.name.replace(/[^a-zA-Z0-9]/g, '_')}_CampaignWaala_Card.png`;
          link.download = fileName;
          link.href = url;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setDownloading(false);
            console.log('Download completed');
          }, 100);

        }, 'image/png', 1.0);
      }

    } catch (error) {
      console.error('Download error details:', error);
      alert(`Download failed: ${error.message}\n\nPlease install: npm install dom-to-image-more`);
      setDownloading(false);
    }
  };

  // Share card
  const handleShareCard = async () => {
    const shareText = `🎉 Check out my Campaign Waala Card!\n\nName: ${userData.name}\nUnique Code: ${userData.uniqueCode}\nEmail: ${userData.email}\nPhone: ${userData.phoneNumber}\n\nJoin Campaign Waala today!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Campaign Waala Card',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(shareText);
        }
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Card details copied to clipboard! You can now share it anywhere.');
    }).catch(() => {
      alert('Unable to share. Please take a screenshot of your card to share.');
    });
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
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
      }`}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105"
      >
        ← Back
      </button>

      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Profile Settings Overview
      </h2>

      <div
        className={`rounded-2xl shadow-lg mb-6 overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-br from-white to-blue-50 border-blue-100"
        }`}
      >
        <div
          className="h-24 sm:h-32 w-full relative"
          style={{
            background: darkMode 
              ? "linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)"
              : "linear-gradient(135deg, #667eea, #764ba2, #f093fb)"
          }}
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              Premium Member
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center -mt-10 pb-6 text-center relative">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {getUserInitial()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h3
            className={`text-lg sm:text-xl font-semibold mt-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            {userData.name}
          </h3>
          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {userData.email}
          </p>
          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {userData.phoneNumber}
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl shadow-lg border-2 mb-6 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-purple-500" : "bg-gradient-to-br from-white to-indigo-50 border-indigo-200"
        }`}
      >
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              kycStatus === 'approved' ? 'bg-green-500 animate-pulse' : 
              kycStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 
              kycStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <h4
              className={`text-base sm:text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              KYC Verification Status
            </h4>
          </div>
          <span
            className={`inline-block mt-2 px-4 py-2 text-sm font-medium rounded-full border ${
              getKYCStatusBadge().bg
            } ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          >
            {getKYCStatusBadge().icon} {getKYCStatusBadge().text}
          </span>
        </div>

        <button
          onClick={() => navigate("/user/kyc-details")}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base shadow-lg"
        >
          ✨ Update Profile / KYC
        </button>
      </div>

      <div
        className={`rounded-2xl border-2 shadow-lg p-6 sm:p-10 text-center transition-all duration-300 hover:shadow-xl relative ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500" : "bg-gradient-to-br from-blue-50 to-purple-100 border-blue-200"
        }`}
      >
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
            NEW
          </span>
        </div>
        
        <h3
          className={`text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
        >
          YOUR CAMPAIGN WAALA CARD
        </h3>
        <p
          className={`text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Your personalized digital card for seamless earnings and exclusive
          benefits.
        </p>

        <div className="flex justify-center items-center mb-6">
          <div className="w-full max-w-2xl relative">
            <div ref={cardRef} className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden border border-blue-200">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400"></div>
              
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-br from-blue-300 to-pink-300 rounded-full opacity-30 blur-2xl"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-black flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <span className="text-white text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>CW</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-black tracking-wide">Campaignwala</h4>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase">
                  {userData.name}
                </h3>
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-blue-800 rounded-2xl p-4 shadow-lg border-2 border-blue-300">
                  <span className="text-white text-sm font-semibold whitespace-nowrap">Unique Code:</span>
                  <span className="text-white text-2xl font-bold bg-blue-900 px-4 py-2 rounded-lg min-w-[120px] text-center tracking-wider">
                    {userData.uniqueCode}
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-3 p-2.5 bg-white bg-opacity-60 rounded-xl border-l-4 border-transparent hover:border-blue-500 hover:bg-opacity-80 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span className="text-gray-700 font-medium text-sm">{userData.email}</span>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-white bg-opacity-60 rounded-xl border-l-4 border-transparent hover:border-blue-500 hover:bg-opacity-80 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-gray-700 font-medium text-sm">{userData.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={handleShareCard}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            Share Card
          </button>
          <button 
            onClick={handleDownloadCard}
            disabled={downloading}
            className={`px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 ${
              downloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {downloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;