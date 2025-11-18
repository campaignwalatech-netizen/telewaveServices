import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, User, Menu, Sun, Moon, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const Navbar = ({ darkMode, setDarkMode, toggleSidebar }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const profileRef = useRef(null);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user initial from localStorage on component mount
  useEffect(() => {
    const getUserInitial = () => {
      try {
        const userData = localStorage.getItem('user');
        console.log('🟢 Raw user data from localStorage:', userData);
        
        if (userData && userData !== 'undefined' && userData !== 'null') {
          const user = JSON.parse(userData);
          console.log('🟢 Parsed user object:', user);
          
          // Get first letter - prioritize firstName, then name, then email
          let name = '';
          if (user.firstName && user.firstName.trim() !== '') {
            name = user.firstName;
          } else if (user.name && user.name.trim() !== '') {
            name = user.name;
          } else if (user.username && user.username.trim() !== '') {
            name = user.username;
          } else if (user.email && user.email.trim() !== '') {
            name = user.email;
          } else {
            name = 'User';
          }
          
          console.log('🟢 Selected name for initial:', name);
          
          const initial = name.charAt(0).toUpperCase();
          console.log('🟢 Final initial to display:', initial);
          setUserInitial(initial);
        } else {
          console.log('🟡 No user data found in localStorage');
          setUserInitial('U');
        }
      } catch (error) {
        console.error('🔴 Error getting user initial:', error);
        setUserInitial('U');
      }
    };

    getUserInitial();
  }, []);

  // Update dropdown position when avatar is clicked
  useEffect(() => {
    if (showProfileMenu && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right - 10 // Adjusted for better positioning
      });
    }
  }, [showProfileMenu]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both avatar and dropdown
      if (
        avatarRef.current && 
        !avatarRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle dropdown menu item clicks
  const handleMenuClick = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  // Logout handler
  const handleLogout = () => {
    setShowProfileMenu(false);
    localStorage.clear();
    navigate("/"); // logout redirect
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full border-b transition-all duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-full max-w-[100vw] overflow-x-hidden">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-1 sm:gap-3 md:gap-6 flex-shrink min-w-0">
          {/* Sidebar Toggle (mobile) */}
          <button
            className="lg:hidden p-1.5 sm:p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition flex-shrink-0"
            onClick={toggleSidebar}
          >
            <Menu
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>

          {/* Brand Logo with Professional Styling */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-default select-none min-w-0">
            {/* CW Logo SVG */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0">
              <svg viewBox="0 0 1189 1189" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="594.5" cy="594.5" r="594.5" fill="#000000"/>
                <circle cx="594.5" cy="594.5" r="534.5" fill="none" stroke="#ffffff" strokeWidth="40"/>
                <circle cx="594.5" cy="594.5" r="474.5" fill="none" stroke="#ffffff" strokeWidth="40"/>
                <text x="594.5" y="700" fontFamily="Georgia, serif" fontSize="380" fill="#ffffff" textAnchor="middle" fontWeight="bold">CW</text>
              </svg>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <h1
                className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight truncate ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
                style={{ fontFamily: "'Poppins', 'SF Pro Display', -apple-system, sans-serif", letterSpacing: '0.02em' }}
              >
                Campaign<span className="text-black font-bold">wala</span>
              </h1>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium tracking-wider uppercase ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
              
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 relative flex-shrink-0">
          {/* Search (Desktop) */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search offers, leads, or profile..."
              className={`w-48 sm:w-64 lg:w-80 pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none transition-all ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* Mobile Search Icon */}
          <button
            className="block md:hidden p-1.5 sm:p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 sm:p-2 rounded-md border transition-all flex-shrink-0 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-yellow-400 hover:bg-gray-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate("/user/notification-page")}
            className={`relative p-1.5 sm:p-2 rounded-full transition-all flex-shrink-0 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            title="Notifications"
          >
            <Bell
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="flex-shrink-0" ref={profileRef}>
            <div
              ref={avatarRef}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform font-semibold text-white text-xs sm:text-sm md:text-base"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {userInitial}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {showSearch && (
        <div className="p-3 border-t md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none transition-all ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* Dropdown Menu - Rendered via Portal */}
      {showProfileMenu && createPortal(
        <div
          ref={dropdownRef}
          className={`rounded-md shadow-lg border py-1 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
          style={{ 
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            width: '12rem',
            zIndex: 100000,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          {/* Profile Button */}
          <button
            onClick={() => handleMenuClick("/user/profile-overview")}
            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>

          {/* User Query Button */}
          <button
            onClick={() => handleMenuClick("/user/query")}
            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> User Query
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>,
        document.body
      )}

      {/* Add fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;