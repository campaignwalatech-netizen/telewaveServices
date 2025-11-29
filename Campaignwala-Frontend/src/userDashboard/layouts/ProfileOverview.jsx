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
    uniqueCode: 'CW000000'
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
        
        // Generate unique code from user ID
        const uniqueCode = (user._id || user.id);
        
        setUserData({
          name: user.name || 'User',
          email: user.email || 'N/A',
          phoneNumber: user.phoneNumber || 'N/A',
          uniqueCode: uniqueCode,
          userId: user._id || user.id
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserData({
        name: 'Error loading',
        email: 'N/A',
        phoneNumber: 'N/A',
        uniqueCode: 'CW' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        userId: 'unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate unique code from user ID
  const generateUniqueCodeFromId = (userId) => {
    if (!userId || userId === 'unknown') {
      return 'CW' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    
    // Convert user ID to a consistent, readable format
    const hash = userId.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const base36 = Math.abs(hash).toString(36).toUpperCase();
    const paddedCode = base36.padStart(6, '0').substr(0, 6);
    
    return `CW${paddedCode}`;
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

  // Download card as image
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
        
        const html2canvas = (await import('html2canvas')).default;
        
        console.log('Using html2canvas fallback...');
        
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
    const shareText = `🎉 Check out my Campaign Waala Card!\n\n👤 Name: ${userData.name}\n🔐 Unique ID: ${userData.uniqueCode}\n📧 Email: ${userData.email}\n📞 Phone: ${userData.phoneNumber}\n\nJoin Campaign Waala today for exclusive benefits! 🚀`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Campaign Waala Digital Card',
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
      alert('🎊 Card details copied to clipboard! You can now share it anywhere.');
    }).catch(() => {
      alert('Unable to share. Please take a screenshot of your card to share.');
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-10 pb-16 px-4 sm:px-6 md:px-10 flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-10 pb-16 px-4 sm:px-6 md:px-10 transition-all duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Profile Overview
        </h2>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Your digital identity with Campaign Waala
        </p>
      </div>

      {/* Profile Card */}
      <div
        className={`rounded-3xl shadow-2xl mb-8 overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700 border-purple-500" : "bg-gradient-to-br from-white to-blue-50 border-blue-200"
        }`}
      >
        <div
          className="h-28 sm:h-36 w-full relative overflow-hidden"
          style={{
            background: darkMode 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-4 right-4">
            <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-full text-white text-sm font-semibold border border-white border-opacity-30">
              ⭐ Premium Member
            </span>
          </div>
          <div className="absolute bottom-4 left-6">
            <span className="text-white text-lg font-bold opacity-90">CAMPAIGN WAALA</span>
          </div>
        </div>

        <div className="flex flex-col items-center -mt-12 pb-8 text-center relative">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white transform group-hover:scale-110 transition-all duration-300">
              {getUserInitial()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mt-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {userData.name}
          </h3>
          <div className="mt-3 space-y-1">
            <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-600"} flex items-center justify-center gap-2`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              {userData.email}
            </p>
            <p className={`text-base ${darkMode ? "text-gray-300" : "text-gray-600"} flex items-center justify-center gap-2`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {userData.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status Card */}
      <div
        className={`rounded-3xl shadow-2xl border-2 mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500 hover:shadow-2xl ${
          darkMode ? "bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500" : "bg-gradient-to-br from-white to-indigo-50 border-indigo-300"
        }`}
      >
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-4 h-4 rounded-full ${
              kycStatus === 'approved' ? 'bg-green-500 animate-pulse' : 
              kycStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 
              kycStatus === 'rejected' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
            }`}></div>
            <h4 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Identity Verification
            </h4>
          </div>
          <span
            className={`inline-block mt-2 px-5 py-3 text-base font-semibold rounded-2xl border-2 ${
              getKYCStatusBadge().bg
            } ${darkMode ? 'border-purple-500' : 'border-indigo-200'} shadow-lg`}
          >
            {getKYCStatusBadge().icon} {getKYCStatusBadge().text}
          </span>
        </div>

        <button
          onClick={() => navigate("/user/kyc-details")}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-lg shadow-2xl flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Update KYC
        </button>
      </div>

      {/* Digital Card Section */}
      <div
        className={`rounded-3xl border-2 shadow-2xl p-6 sm:p-10 text-center transition-all duration-500 hover:shadow-2xl relative overflow-hidden ${
          darkMode ? "bg-gradient-to-br from-gray-800 via-purple-900 to-gray-800 border-purple-500" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-300"
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
            🔥 EXCLUSIVE
          </span>
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          YOUR DIGITAL IDENTITY CARD
        </h3>
        <p className={`text-lg mb-8 max-w-2xl mx-auto leading-relaxed ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}>
          Your unique digital identity for seamless access to exclusive campaigns and earnings
        </p>

        {/* Digital Card */}
        <div className="flex justify-center items-center mb-8">
          <div className="w-full max-w-2xl relative">
            <div ref={cardRef} className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl shadow-2xl p-8 relative overflow-hidden border-2 border-blue-300 transform hover:scale-[1.02] transition-all duration-500">
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
              
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              {/* Background Ornaments */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-40 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full opacity-40 blur-3xl"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-4 border-black bg-white flex items-center justify-center shadow-lg">
                      <div className="w-16 h-16 rounded-xl border-3 border-black flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                        <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center">
                          <span className="text-white text-xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>CW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-black tracking-widest">CAMPAIGNWAALA</h4>
                    <p className="text-xs text-gray-600 font-semibold">DIGITAL PARTNER</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-1"></div>
                  <span className="text-xs text-gray-600 font-bold">ACTIVE</span>
                </div>
              </div>

              {/* User Name */}
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide">
                  {userData.name}
                </h3>
              </div>

              {/* Unique Code - Enhanced Design */}
              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-r from-blue-800 to-purple-800 rounded-3xl p-6 shadow-2xl border-2 border-blue-400 relative overflow-hidden">
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                  
                  <span className="text-white text-sm font-semibold tracking-widest">UNIQUE IDENTIFICATION CODE</span>
                  <span className="text-white text-4xl font-black bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent tracking-widest">
                    {userData.uniqueCode}
                  </span>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3].map((star) => (
                      <div key={star} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" 
                           style={{ animationDelay: `${star * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 max-w-md mx-auto relative z-10">
                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-70 rounded-2xl border-l-4 border-blue-500 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 group shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-lg">{userData.email}</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white bg-opacity-70 rounded-2xl border-l-4 border-green-500 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 group shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-lg">{userData.phoneNumber}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 relative z-10">
                <p className="text-xs text-gray-600 font-semibold tracking-widest">
                  OFFICIAL DIGITAL IDENTITY CARD • VALID ACROSS ALL PLATFORMS
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleShareCard}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl text-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            Share Digital Card
          </button>
          <button 
            onClick={handleDownloadCard}
            disabled={downloading}
            className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-3 ${
              downloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {downloading ? (
              <>
                <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download Card
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default ProfileOverview;