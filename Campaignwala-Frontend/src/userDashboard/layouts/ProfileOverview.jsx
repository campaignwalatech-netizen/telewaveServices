import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

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

  // Generate unique code from user ID
  const generateUniqueCodeFromId = useCallback((userId) => {
    if (!userId || userId === 'unknown') {
      return 'FW' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    
    // Convert user ID to a consistent, readable format
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
        
        // Generate unique code from user ID
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

  // Helper function to convert any color value to hex (handles oklch, rgb, rgba, etc.)
  const convertToHex = (colorValue) => {
    if (!colorValue || typeof colorValue !== 'string') return null;
    
    // If it's already hex, return it
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    
    // If it contains oklch, convert to safe fallback
    if (colorValue.includes('oklch')) {
      // Try to determine the color from oklch values
      const lightnessMatch = colorValue.match(/oklch\(([\d.]+)/);
      if (lightnessMatch) {
        const lightness = parseFloat(lightnessMatch[1]);
        if (lightness > 0.8) return '#ffffff';
        if (lightness < 0.2) return '#000000';
      }
      // Default fallback
      return '#000000';
    }
    
    // If it's rgb/rgba, convert to hex
    if (colorValue.startsWith('rgb')) {
      const rgbMatch = colorValue.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        return `#${[r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
      }
    }
    
    return null;
  };


  // Download card as image with improved quality
  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      const cardElement = cardRef.current;
      
      if (!cardElement) {
        alert('Card element not found');
        setDownloading(false);
        return;
      }

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2canvas = (await import('html2canvas')).default;
      
      // Create a clone of the card element
      const clonedElement = cardElement.cloneNode(true);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.transform = 'none';
      clonedElement.style.opacity = '1';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.display = 'block';
      document.body.appendChild(clonedElement);

      // AGGRESSIVE: Remove ALL class attributes to prevent any CSS class from generating oklch colors
      const allElements = [clonedElement, ...clonedElement.querySelectorAll('*')];
      allElements.forEach(el => {
        // Remove all class attributes - this prevents Tailwind from generating oklch colors
        if (el.hasAttribute('class')) {
          el.removeAttribute('class');
        }
        
        // Remove animations and transitions
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.style.animation = 'none';
        el.style.animationDelay = '0s';
        el.style.filter = el.style.filter?.replace('blur', '') || 'none';
        
        // Convert ALL computed styles to explicit inline hex colors
        try {
          const computedStyle = window.getComputedStyle(el);
          
          // CRITICAL: Handle ALL background-related properties first
          const backgroundProperties = [
            'backgroundColor',
            'background',
            'backgroundImage'
          ];
          
          backgroundProperties.forEach(prop => {
            try {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value !== 'none' && value !== 'transparent' && 
                  value !== 'initial' && value !== 'inherit' && value.trim() !== '') {
                // If it contains oklch, gradient, or url, replace with solid color
                if (value.includes('oklch') || value.includes('gradient') || value.includes('url')) {
                  el.style.setProperty('backgroundColor', '#ffffff', 'important');
                  el.style.setProperty('background', 'none', 'important');
                  el.style.setProperty('backgroundImage', 'none', 'important');
                } else if (!value.startsWith('#') && !value.startsWith('rgb')) {
                  const hexColor = convertToHex(value);
                  if (hexColor) {
                    el.style.setProperty('backgroundColor', hexColor, 'important');
                  } else {
                    el.style.setProperty('backgroundColor', '#ffffff', 'important');
                  }
                  el.style.setProperty('background', 'none', 'important');
                  el.style.setProperty('backgroundImage', 'none', 'important');
                } else if (value.startsWith('rgb')) {
                  const hexColor = convertToHex(value);
                  if (hexColor) {
                    el.style.setProperty('backgroundColor', hexColor, 'important');
                  }
                  el.style.setProperty('background', 'none', 'important');
                  el.style.setProperty('backgroundImage', 'none', 'important');
                }
              }
            } catch {
              // Ignore errors
            }
          });
          
          // Convert all other color-related properties to hex
          const colorProperties = [
            'color', 'borderColor', 'borderTopColor', 
            'borderRightColor', 'borderBottomColor', 'borderLeftColor',
            'outlineColor', 'textDecorationColor', 'columnRuleColor',
            'fill', 'stroke'
          ];
          
          colorProperties.forEach(prop => {
            try {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value !== 'none' && value !== 'transparent' && 
                  value !== 'initial' && value !== 'inherit' && value.trim() !== '') {
                // Always convert to hex, even if it's already rgb
                const hexColor = convertToHex(value);
                if (hexColor) {
                  el.style.setProperty(prop, hexColor, 'important');
                } else {
                  // Safe fallback
                  const fallback = prop === 'backgroundColor' ? '#ffffff' : 
                                  prop === 'color' ? '#000000' : 
                                  prop.includes('border') ? '#e5e7eb' : '#000000';
                  el.style.setProperty(prop, fallback, 'important');
                }
              }
            } catch {
              // Ignore errors
            }
          });
          
          // Also copy important layout properties
          const layoutProperties = [
            'width', 'height', 'padding', 'paddingTop', 'paddingRight', 
            'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 
            'marginRight', 'marginBottom', 'marginLeft', 'border', 
            'borderWidth', 'borderStyle', 'borderRadius', 'display', 
            'flexDirection', 'justifyContent', 'alignItems', 'gap',
            'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
            'textAlign', 'position', 'top', 'right', 'bottom', 'left',
            'zIndex', 'overflow', 'objectFit'
          ];
          
          layoutProperties.forEach(prop => {
            try {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value !== 'initial' && value !== 'inherit' && value.trim() !== '') {
                el.style.setProperty(prop, value, 'important');
              }
            } catch {
              // Ignore errors
            }
          });
        } catch {
          // Ignore errors
        }
        
        // CRITICAL: Clean up inline styles that might contain oklch in background
        if (el.style.cssText) {
          let cssText = el.style.cssText;
          // Replace any oklch in background properties
          cssText = cssText.replace(/background[^:]*:\s*[^;]*oklch[^;]*/gi, 'background: none; backgroundColor: #ffffff;');
          cssText = cssText.replace(/oklch\([^)]+\)/g, '#ffffff');
          el.style.cssText = cssText;
        }
        
        // Special handling for SVG elements
        if (el.tagName === 'svg' || el.tagName === 'path' || el.tagName === 'circle' || 
            el.tagName === 'rect' || el.tagName === 'polyline' || el.tagName === 'polygon') {
          // Convert SVG fill and stroke attributes to explicit hex
          const fillAttr = el.getAttribute('fill');
          const strokeAttr = el.getAttribute('stroke');
          
          if (fillAttr === 'currentColor' || fillAttr === 'none' || !fillAttr) {
            const computedColor = window.getComputedStyle(el).color;
            const hexColor = convertToHex(computedColor) || '#000000';
            el.setAttribute('fill', hexColor);
          } else if (fillAttr && fillAttr.includes('oklch')) {
            const hexColor = convertToHex(fillAttr) || '#000000';
            el.setAttribute('fill', hexColor);
          }
          
          if (strokeAttr === 'currentColor' || strokeAttr === 'none' || !strokeAttr) {
            const computedColor = window.getComputedStyle(el).color;
            const hexColor = convertToHex(computedColor) || '#000000';
            el.setAttribute('stroke', hexColor);
          } else if (strokeAttr && strokeAttr.includes('oklch')) {
            const hexColor = convertToHex(strokeAttr) || '#000000';
            el.setAttribute('stroke', hexColor);
          }
        }
      });

      // Force a reflow to ensure all style changes are applied
      void clonedElement.offsetHeight;
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force another reflow
      void clonedElement.offsetHeight;

      const canvas = await html2canvas(clonedElement, {
        backgroundColor: '#ffffff',
        scale: 4, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 20000,
        width: clonedElement.offsetWidth,
        height: clonedElement.offsetHeight,
        windowWidth: clonedElement.scrollWidth,
        windowHeight: clonedElement.scrollHeight,
        pixelRatio: 4,
        foreignObjectRendering: false, // Disable foreign object rendering which can cause oklch issues
        ignoreElements: () => {
          // Skip elements that might have problematic styles
          return false; // We want to render everything, just with converted colors
        },
        onclone: (clonedDoc) => {
          // CRITICAL: Remove ALL stylesheets and style tags to prevent html2canvas from reading oklch colors
          const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleSheets.forEach(sheet => sheet.remove());
          
          // Helper function to convert colors to hex (inline for onclone context)
          const convertColorToHex = (colorValue) => {
            if (!colorValue || typeof colorValue !== 'string') return null;
            if (colorValue.startsWith('#')) return colorValue;
            
            // If it contains oklch, immediately return fallback
            if (colorValue.includes('oklch')) {
              return '#ffffff'; // Default to white for backgrounds
            }
            
            if (colorValue.startsWith('rgb')) {
              const rgbMatch = colorValue.match(/\d+/g);
              if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0]);
                const g = parseInt(rgbMatch[1]);
                const b = parseInt(rgbMatch[2]);
                return `#${[r, g, b].map(x => {
                  const hex = x.toString(16);
                  return hex.length === 1 ? '0' + hex : hex;
                }).join('')}`;
              }
            }
            
            return null;
          };
          
          // Convert all styles in the cloned document to hex colors
          const allClonedElements = [clonedDoc.documentElement, ...clonedDoc.querySelectorAll('*')];
          allClonedElements.forEach(el => {
            // Remove animations
            el.style.transform = 'none';
            el.style.transition = 'none';
            el.style.animation = 'none';
            el.style.animationDelay = '0s';
            
            // Convert all color styles to hex (removes oklch)
            try {
              const computedStyle = window.getComputedStyle(el);
              
              // CRITICAL: Handle ALL background-related properties
              const backgroundProperties = [
                'backgroundColor',
                'background',
                'backgroundImage',
                'backgroundColor'
              ];
              
              backgroundProperties.forEach(prop => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (value && value !== 'none' && value !== 'transparent' && 
                      value !== 'initial' && value !== 'inherit' && value.trim() !== '') {
                    // If it contains oklch or is not a simple color, replace it
                    if (value.includes('oklch') || value.includes('gradient') || value.includes('url')) {
                      // For backgrounds, always use white
                      el.style.setProperty('backgroundColor', '#ffffff', 'important');
                      el.style.setProperty('background', 'none', 'important');
                      el.style.setProperty('backgroundImage', 'none', 'important');
                    } else if (!value.startsWith('#') && !value.startsWith('rgb')) {
                      const hexColor = convertColorToHex(value);
                      if (hexColor) {
                        el.style.setProperty('backgroundColor', hexColor, 'important');
                      } else {
                        el.style.setProperty('backgroundColor', '#ffffff', 'important');
                      }
                      el.style.setProperty('background', 'none', 'important');
                      el.style.setProperty('backgroundImage', 'none', 'important');
                    } else if (value.startsWith('rgb')) {
                      const hexColor = convertColorToHex(value);
                      if (hexColor) {
                        el.style.setProperty('backgroundColor', hexColor, 'important');
                      }
                      el.style.setProperty('background', 'none', 'important');
                      el.style.setProperty('backgroundImage', 'none', 'important');
                    }
                  }
                } catch {
                  // Ignore errors
                }
              });
              
              const colorProperties = [
                'color',
                'borderColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'outlineColor',
                'textDecorationColor',
                'columnRuleColor',
                'fill',
                'stroke'
              ];
              
              colorProperties.forEach(prop => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (value && value !== 'none' && value !== 'transparent' && 
                      value !== 'initial' && value !== 'inherit' && value.trim() !== '') {
                    if (value.includes('oklch') || (!value.startsWith('#') && !value.startsWith('rgb') && value.trim() !== '')) {
                      const hexColor = convertColorToHex(value);
                      if (hexColor) {
                        el.style.setProperty(prop, hexColor, 'important');
                      } else {
                        const fallback = prop === 'color' ? '#000000' : 
                                        prop.includes('border') ? '#e5e7eb' : '#000000';
                        el.style.setProperty(prop, fallback, 'important');
                      }
                    } else if (value.startsWith('rgb')) {
                      const hexColor = convertColorToHex(value);
                      if (hexColor) {
                        el.style.setProperty(prop, hexColor, 'important');
                      }
                    }
                  }
                } catch {
                  // Ignore errors
                }
              });
              
              // Fix inline styles - replace all oklch with hex
              if (el.style.cssText) {
                el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/g, '#ffffff');
                el.style.cssText = el.style.cssText.replace(/background[^:]*:\s*[^;]*oklch[^;]*/gi, 'background: none; backgroundColor: #ffffff;');
              }
            } catch {
              // Ignore errors
            }
          });
        }
      });

      // Remove cloned element
      document.body.removeChild(clonedElement);

      // Convert to blob with high quality
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create image. Please try again.');
          setDownloading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${userData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Digital_Card.png`;
        link.download = fileName;
        link.href = url;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, 100);

      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Download error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // More specific error message
      let errorMessage = 'Download failed. ';
      if (error.message && error.message.includes('oklch')) {
        errorMessage += 'Color format issue detected. Please try again or contact support.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage);
      setDownloading(false);
    }
  };

  // Share card
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

        {/* Digital Card - Simple Clean Design */}
        <div className="flex justify-center items-center mb-8">
          <div className="w-full max-w-2xl relative">
            <div 
              ref={cardRef} 
              data-card-element
              className="bg-white rounded-xl p-8 relative"
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Top Accent Bar - Simple Solid Color */}
              <div 
                className="absolute top-0 left-0 w-full h-2"
                style={{ backgroundColor: '#667eea' }}
              ></div>
              
              <div className="pt-4">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div 
                        className="inline-flex items-center justify-center h-16 w-16 rounded-lg overflow-hidden"
                        style={{ 
                          border: '2px solid #667eea',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black" style={{ color: '#1f2937' }}>
                        FREELANCER WALA
                      </h4>
                      <p className="text-xs font-semibold mt-1" style={{ color: '#6b7280' }}>
                        TELECALLING HR
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="w-3 h-3 rounded-full mb-1 mx-auto"
                      style={{ backgroundColor: '#10b981' }}
                    ></div>
                    <span className="text-xs font-bold uppercase" style={{ color: '#10b981' }}>
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Member Name Section */}
                <div className="mb-6 pb-6" style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <p 
                    className="text-xs font-bold mb-2 uppercase"
                    style={{ color: '#9ca3af' }}
                  >
                    MEMBER NAME
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black uppercase" style={{ color: '#1f2937' }}>
                    {userData.name}
                  </h3>
                </div>

                {/* Unique Code Section - Simple Design */}
                <div className="text-center mb-6">
                  <div 
                    className="inline-flex flex-col items-center gap-3 rounded-lg p-6"
                    style={{ 
                      backgroundColor: '#667eea',
                      border: '2px solid #667eea'
                    }}
                  >
                    <span className="text-white text-xs font-bold uppercase">
                      UNIQUE IDENTIFICATION CODE
                    </span>
                    <span className="text-white text-4xl sm:text-5xl font-black">
                      {userData.uniqueCode}
                    </span>
                  </div>
                </div>

                {/* Contact Info - Simple Cards */}
                <div className="space-y-3 max-w-md mx-auto">
                  <div 
                    className="flex items-center gap-4 p-4 rounded-lg border-l-4"
                    style={{ 
                      backgroundColor: '#f3f4f6',
                      borderLeftColor: '#3b82f6'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <span className="font-semibold text-base" style={{ color: '#1f2937' }}>
                      {userData.email}
                    </span>
                  </div>

                  <div 
                    className="flex items-center gap-4 p-4 rounded-lg border-l-4"
                    style={{ 
                      backgroundColor: '#f3f4f6',
                      borderLeftColor: '#10b981'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <span className="font-semibold text-base" style={{ color: '#1f2937' }}>
                      {userData.phoneNumber}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="text-center mt-8 pt-6"
                  style={{ borderTop: '2px solid #e5e7eb' }}
                >
                  <p 
                    className="text-xs font-bold uppercase mb-1"
                    style={{ color: '#6b7280' }}
                  >
                    OFFICIAL DIGITAL IDENTITY CARD
                  </p>
                  <p 
                    className="text-xs font-medium"
                    style={{ color: '#9ca3af' }}
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
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download Card
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProfileOverview;