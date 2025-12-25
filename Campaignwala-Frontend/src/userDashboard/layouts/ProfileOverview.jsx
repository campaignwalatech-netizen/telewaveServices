import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ProfileOverview = ({ darkMode }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    phoneNumber: '+91 98765 43210',
    uniqueCode: 'FW000000'
  });
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const generateUniqueCodeFromId = useCallback((userId) => {
    if (!userId || userId === 'unknown') {
      return 'FW' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    
    const hash = userId.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const base36 = Math.abs(hash).toString(36).toUpperCase();
    const paddedCode = base36.padStart(6, '0').substr(0, 6);
    
    return `FW${paddedCode}`;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        const user = response.data.data.user;
        const uniqueCode = generateUniqueCodeFromId(user._id || user.id);
        
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
        uniqueCode: 'FW' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        userId: 'unknown'
      });
    } finally {
      setLoading(false);
    }
  }, [generateUniqueCodeFromId]);

  const fetchKYCStatus = useCallback(async () => {
    try {
      const response = await api.get('/users/kyc');
      if (response.data.success) {
        const status = response.data.data?.kycDetails?.kycStatus || 'not_submitted';
        setKycStatus(status);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setKycStatus('not_submitted');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchKYCStatus();
  }, [fetchUserProfile, fetchKYCStatus]);

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
        text: 'Pending Review',
        icon: '⏳'
      },
      'approved': {
        bg: darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700',
        text: 'Verified',
        icon: '✓'
      },
      'rejected': {
        bg: darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
        text: 'Rejected',
        icon: '✗'
      },
      'not_submitted': {
        bg: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
        text: 'Not Submitted',
        icon: '📝'
      }
    };

    return statusConfig[kycStatus?.toLowerCase()] || statusConfig['not_submitted'];
  };

  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      
      // Create a completely static HTML template with no CSS references
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif; 
              background: white;
              width: 400px;
              height: 500px;
            }
            .card {
              width: 100%;
              height: 100%;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              position: relative;
              box-sizing: border-box;
            }
            .top-bar {
              width: 100%;
              height: 4px;
              background: #667eea;
            }
            .content {
              padding: 16px;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              align-items: flex-start;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .logo {
              width: 48px;
              height: 48px;
              border: 2px solid #667eea;
              border-radius: 8px;
              margin-right: 12px;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #667eea;
            }
            .header-text h4 {
              margin: 0;
              color: #1f2937;
              font-size: 16px;
              font-weight: 900;
            }
            .header-text p {
              margin: 2px 0 0 0;
              color: #6b7280;
              font-size: 11px;
              font-weight: 600;
            }
            .section {
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .label {
              color: #9ca3af;
              margin: 0 0 4px 0;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .name {
              color: #1f2937;
              margin: 0;
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
            }
            .code-box {
              background: #667eea;
              padding: 10px 20px;
              border-radius: 8px;
              text-align: center;
            }
            .code {
              color: white;
              font-size: 22px;
              font-weight: 900;
              letter-spacing: 3px;
            }
            .contact-item {
              background: #f9fafb;
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
            }
            .icon {
              width: 32px;
              height: 32px;
              border-radius: 6px;
              margin-right: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .contact-text {
              color: #1f2937;
              font-size: 12px;
              font-weight: 600;
              flex: 1;
            }
            .footer {
              text-align: center;
              padding-top: 8px;
            }
            .footer-title {
              color: #6b7280;
              margin: 0 0 2px 0;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .footer-subtitle {
              color: #9ca3af;
              margin: 0;
              font-size: 9px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="top-bar"></div>
            <div class="content">
              <div class="header">
                <div class="logo">FW</div>
                <div class="header-text">
                  <h4>FREELANCER WALA</h4>
                  <p>TELECALLING HR</p>
                </div>
              </div>
              
              <div class="section">
                <div class="label">MEMBER NAME</div>
                <div class="name">${userData.name.toUpperCase()}</div>
              </div>
              
              <div class="section">
                <div class="label">UNIQUE IDENTIFICATION CODE</div>
                <div class="code-box">
                  <div class="code">${userData.uniqueCode}</div>
                </div>
              </div>
              
              <div class="section">
                <div class="contact-item">
                  <div class="icon" style="background: #3b82f6;">E</div>
                  <div class="contact-text">${userData.email}</div>
                </div>
                <div class="contact-item">
                  <div class="icon" style="background: #10b981;">P</div>
                  <div class="contact-text">${userData.phoneNumber}</div>
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-title">OFFICIAL DIGITAL IDENTITY CARD</div>
                <div class="footer-subtitle">VALID ACROSS ALL PLATFORMS</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Create a hidden iframe with the template
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '400px';
      iframe.style.height = '500px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      // Write HTML to iframe
      iframe.contentDocument.write(htmlTemplate);
      iframe.contentDocument.close();
      
      // Wait for iframe to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas on the iframe content
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(iframe.contentDocument.body, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      // Remove iframe
      document.body.removeChild(iframe);
      
      // Create PDF
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `${userData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Digital_Card.pdf`;
      pdf.save(fileName);
      
      setDownloading(false);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate PDF. Please take a screenshot instead.');
      setDownloading(false);
    }
  };

  const handleShareCard = async () => {
    const shareText = `Freelancer Wala Digital Card\n\nName: ${userData.name}\nUnique ID: ${userData.uniqueCode}\nEmail: ${userData.email}\nPhone: ${userData.phoneNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Freelancer Wala Digital Card',
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
      alert('Card details copied to clipboard!');
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
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`mb-6 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
          darkMode 
            ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700" 
            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          Profile Overview
        </h2>
        <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Your digital identity card
        </p>
      </div>

      {/* Profile Card */}
      <div
        className={`rounded-xl shadow-lg mb-8 overflow-hidden border transition-all duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`h-24 sm:h-32 w-full relative ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </span>
          </div>
          <div className="absolute bottom-4 left-6">
            <span className={`text-sm font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              FREELANCER WALA
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center -mt-10 pb-8 text-center relative">
          <div className="relative">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl sm:text-3xl font-bold ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {getUserInitial()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mt-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {userData.name}
          </h3>
          <div className="mt-3 space-y-1">
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} flex items-center justify-center gap-2`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              {userData.email}
            </p>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} flex items-center justify-center gap-2`}>
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
        className={`rounded-xl shadow-lg border mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${
              kycStatus === 'approved' ? 'bg-green-500' : 
              kycStatus === 'pending' ? 'bg-yellow-500' : 
              kycStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <h4 className={`text-lg sm:text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Identity Verification
            </h4>
          </div>
          <span
            className={`inline-block mt-2 px-4 py-2 text-sm font-semibold rounded-lg border ${
              getKYCStatusBadge().bg
            } ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
          >
            {getKYCStatusBadge().icon} {getKYCStatusBadge().text}
          </span>
        </div>

        <button
          onClick={() => navigate("/user/kyc-details")}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-base flex items-center gap-2 ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Update KYC
        </button>
      </div>

      {/* Digital Card Section */}
      <div
        className={`rounded-xl border shadow-lg p-6 sm:p-10 text-center transition-all duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          YOUR DIGITAL IDENTITY CARD
        </h3>
        <p className={`text-base mb-8 max-w-2xl mx-auto ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}>
          Your unique digital identity for seamless access to exclusive campaigns and earnings
        </p>

        {/* Digital Card - This will be captured for PDF */}
        <div className="flex justify-center items-center mb-8">
          <div className="w-full max-w-md relative">
            <div 
              ref={cardRef}
              className="bg-white rounded-lg relative overflow-hidden"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {/* Top Accent Bar */}
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: '#667eea' }}
              ></div>
              
              <div style={{ padding: '16px' }}>
                {/* Header Section */}
                <div className="flex items-start mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="shrink-0"
                      style={{ 
                        width: '48px',
                        height: '48px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <img 
                        src="/logo.jpeg" 
                        alt="Logo" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          display: 'block'
                        }} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 style={{ 
                        color: '#1f2937', 
                        margin: 0, 
                        fontSize: '16px',
                        fontWeight: '900',
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '1.2'
                      }}>
                        FREELANCER WALA
                      </h4>
                      <p style={{ 
                        color: '#6b7280', 
                        margin: '2px 0 0 0', 
                        fontSize: '11px',
                        fontWeight: '600',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        TELECALLING HR
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Name Section */}
                <div className="mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                  <p 
                    style={{ 
                      color: '#9ca3af', 
                      margin: 0, 
                      fontSize: '9px', 
                      fontWeight: '700',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '4px'
                    }}
                  >
                    MEMBER NAME
                  </p>
                  <h3 style={{ 
                    color: '#1f2937', 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '900',
                    fontFamily: 'Arial, sans-serif',
                    textTransform: 'uppercase',
                    lineHeight: '1.2',
                    wordBreak: 'break-word'
                  }}>
                    {userData.name}
                  </h3>
                </div>

                {/* Unique Code Section */}
                <div className="mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                  <p 
                    style={{ 
                      color: '#9ca3af', 
                      margin: 0, 
                      fontSize: '9px', 
                      fontWeight: '700',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}
                  >
                    UNIQUE IDENTIFICATION CODE
                  </p>
                  <div 
                    style={{ 
                      backgroundColor: '#667eea',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ 
                      color: '#ffffff',
                      fontSize: '22px',
                      fontWeight: '900',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '3px',
                      display: 'block'
                    }}>
                      {userData.uniqueCode}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                  <div 
                    style={{ 
                      backgroundColor: '#f9fafb',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div 
                      style={{ 
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <svg style={{ width: '16px', height: '16px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <span style={{ 
                      fontWeight: '600',
                      fontSize: '12px',
                      color: '#1f2937',
                      fontFamily: 'Arial, sans-serif',
                      flex: 1,
                      minWidth: 0,
                      wordBreak: 'break-word'
                    }}>
                      {userData.email}
                    </span>
                  </div>

                  <div 
                    style={{ 
                      backgroundColor: '#f9fafb',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div 
                      style={{ 
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#10b981',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <svg style={{ width: '16px', height: '16px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <span style={{ 
                      fontWeight: '600',
                      fontSize: '12px',
                      color: '#1f2937',
                      fontFamily: 'Arial, sans-serif',
                      flex: 1,
                      minWidth: 0,
                      wordBreak: 'break-word'
                    }}>
                      {userData.phoneNumber}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  style={{ 
                    paddingTop: '8px',
                    textAlign: 'center'
                  }}
                >
                  <p 
                    style={{ 
                      color: '#6b7280', 
                      margin: 0, 
                      fontSize: '9px', 
                      fontWeight: '700',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '2px'
                    }}
                  >
                    OFFICIAL DIGITAL IDENTITY CARD
                  </p>
                  <p 
                    style={{ 
                      color: '#9ca3af', 
                      margin: 0, 
                      fontSize: '9px',
                      fontWeight: '500',
                      fontFamily: 'Arial, sans-serif'
                    }}
                  >
                    VALID ACROSS ALL PLATFORMS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleShareCard}
            className={`px-8 py-4 text-white rounded-xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
              darkMode 
                ? "bg-gray-700 hover:bg-gray-600" 
                : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            Share Digital Card
          </button>
          <button 
            onClick={handleDownloadCard}
            disabled={downloading}
            className={`px-8 py-4 text-white rounded-xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
              downloading 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            style={{ 
              backgroundColor: downloading ? '#9ca3af' : '#4406cb',
            }}
            onMouseEnter={(e) => {
              if (!downloading) {
                e.target.style.backgroundColor = '#3505a0';
              }
            }}
            onMouseLeave={(e) => {
              if (!downloading) {
                e.target.style.backgroundColor = '#4406cb';
              }
            }}
          >
            {downloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;