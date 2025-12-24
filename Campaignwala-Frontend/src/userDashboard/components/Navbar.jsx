import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Menu, Sun, Moon, LogOut, MessageCircle, Wallet, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import walletService from "../../services/walletService";
import userService from "../../services/userService";
import notificationService from "../../services/notificationService";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";

const Navbar = ({ darkMode, setDarkMode, toggleSidebar }) => {
  const user = useSelector(selectUser);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Initialize attendance status from localStorage
  const [isPresent, setIsPresent] = useState(() => {
    const savedStatus = localStorage.getItem("attendanceStatus");
    return savedStatus === "present";
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isWithinTimeRange, setIsWithinTimeRange] = useState(true); // Track if within allowed time
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const profileRef = useRef(null);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ---------------------------
  // CHECK TIME RANGE FUNCTION
  // ---------------------------
  const checkTimeRange = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert to minutes since midnight for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = 0 * 60 + 1; // 00:01 AM
    const endTimeInMinutes = 10 * 60 + 0; // 10:00 AM
    
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };

  // ---------------------------
  // UPDATE TIME RANGE STATUS
  // ---------------------------
  useEffect(() => {
    // Check immediately on load
    setIsWithinTimeRange(checkTimeRange());
    
    // Set up interval to check time range every minute
    const timeCheckInterval = setInterval(() => {
      const isWithinRange = checkTimeRange();
      setIsWithinTimeRange(isWithinRange);
      
      // If time passes 10:00 AM and user hasn't marked attendance, mark as absent
      if (!isWithinRange && !isPresent) {
        // Only auto-mark if not already marked today
        const today = new Date().toDateString();
        const lastMarkedDate = localStorage.getItem("lastAttendanceDate");
        
        if (lastMarkedDate !== today) {
          setIsPresent(false);
          localStorage.setItem("attendanceStatus", "absent");
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(timeCheckInterval);
  }, [isPresent]);

  // ---------------------------
  // HANDLE MOBILE VIEW
  // ---------------------------
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------------------
  // GET USER INITIAL
  // ---------------------------
  useEffect(() => {
    const getUserInitial = () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored || stored === "undefined" || stored === "null") {
          setUserInitial("U");
          return;
        }

        const userObj = JSON.parse(stored);
        const name =
          userObj.firstName ||
          userObj.name ||
          userObj.username ||
          userObj.email ||
          "User";

        setUserInitial(name.charAt(0).toUpperCase());
      } catch {
        setUserInitial("U");
      }
    };

    getUserInitial();
  }, []);

  // ---------------------------
  // FETCH LIVE WALLET BALANCE
  // ---------------------------
  useEffect(() => {
    if (!user?._id) return;

    const getBalance = async () => {
      try {
        const res = await walletService.getWalletByUserId(user._id);
        if (res.success && res.data) {
          const freshBalance = res.data.balance || 0;
          setWalletBalance(freshBalance);
          localStorage.setItem("walletBalance", freshBalance.toString());
        }
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };

    getBalance();
  }, [user]);

  // ---------------------------
  // CHECK TODAY'S ATTENDANCE ON LOAD
  // ---------------------------
  useEffect(() => {
    const checkTodayAttendance = async () => {
      try {
        const response = await userService.getTodayAttendance();
        if (response.success && response.data) {
          const isMarkedPresent = response.data.status === "present";
          setIsPresent(isMarkedPresent);
          localStorage.setItem("attendanceStatus", isMarkedPresent ? "present" : "absent");
          localStorage.setItem("lastAttendanceDate", new Date().toDateString());
        }
      } catch (error) {
        console.error("Error fetching today's attendance:", error);
      }
    };

    checkTodayAttendance();
  }, []);

  // ---------------------------
  // FETCH NOTIFICATION COUNT
  // ---------------------------
  useEffect(() => {
    if (!user?._id) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await notificationService.getUserNotifications({
          page: 1,
          limit: 100
        });
        
        if (response.success && response.data.notifications) {
          // Count unread notifications (for now, all are considered unread)
          // In future, backend can add read status tracking
          setUnreadNotificationCount(response.data.notifications.length);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ---------------------------
  // UPDATE DROPDOWN POSITION
  // ---------------------------
  useEffect(() => {
    if (showProfileMenu && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right - (isMobile ? 5 : 10),
      });
    }
  }, [showProfileMenu, isMobile]);

  // ---------------------------
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ---------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------
  // ATTENDANCE TOGGLE (WITH API CALL)
  // ---------------------------
  const handleAttendanceToggle = async () => {
    // Prevent action if not within time range or already loading
    if (attendanceLoading || !isWithinTimeRange) return;
    
    setAttendanceLoading(true);
    const newStatus = !isPresent;
    const statusValue = newStatus ? "present" : "absent";

    try {
      const response = await userService.markAttendance({ status: statusValue });
      
      if (response.success) {
        setIsPresent(newStatus);
        localStorage.setItem("attendanceStatus", statusValue);
        localStorage.setItem("lastAttendanceDate", new Date().toDateString());
        
        console.log("Attendance marked successfully:", response.message);
        
        // Fetch updated status
        const todayResponse = await userService.getTodayAttendance();
        if (todayResponse.success && todayResponse.data) {
          const updatedStatus = todayResponse.data.status === "present";
          setIsPresent(updatedStatus);
          localStorage.setItem("attendanceStatus", updatedStatus ? "present" : "absent");
        }
      } else {
        console.error("Failed to mark attendance:", response.message);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const formatWalletBalance = (amount) => {
    if (isMobile && amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleMenuClick = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const handleWalletClick = () => navigate("/user/wallet-withdrawl");

  const handleLogout = () => {
    setShowProfileMenu(false);
    localStorage.clear();
    navigate("/"); // Use navigate instead of window.location.href
    window.location.reload(); // Only reload if needed for auth cleanup
  };

  // Truncate text for mobile
  const renderAttendanceText = () => {
    if (!isWithinTimeRange && !isPresent) {
      return isMobile ? "Time Over" : "Time Over (Absent)";
    }
    
    if (attendanceLoading) {
      return isMobile ? "..." : "Processing...";
    }
    return isPresent ? "Present" : "Absent";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full border-b transition-all duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 w-full max-w-[100vw] overflow-x-hidden">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Menu toggle */}
          <button
            className="p-1.5 md:p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0"
            onClick={toggleSidebar}
          >
            <Menu className={`w-4 h-4 md:w-5 md:h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
          </button>

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-400"
            />
            {!isMobile && (
              <span className="font-bold text-lg">
                Freelancer Wala
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          {/* ATTENDANCE BUTTON */}
          <button
            onClick={handleAttendanceToggle}
            disabled={attendanceLoading || !isWithinTimeRange || isPresent}
            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 font-semibold shadow-md transition-all border shrink-0 ${
              !isWithinTimeRange && !isPresent
                ? darkMode
                  ? "bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                : attendanceLoading
                ? darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                : isPresent
                ? darkMode
                  ? "bg-green-900 border-green-700 text-gray-200"
                  : "bg-green-900 border-green-400 text-gray-100"
                : darkMode
                ? "bg-red-900 border-red-700 text-gray-100 hover:bg-red-800"
                : "bg-red-900 border-red-400 text-gray-100 hover:bg-red-800"
            }`}
            title={!isWithinTimeRange && !isPresent ? "Attendance can only be marked between 00:01 AM to 10:00 AM" : ""}
          >
            {attendanceLoading ? (
              <>
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs md:text-sm">{isMobile ? "..." : "Processing..."}</span>
              </>
            ) : (
              <>
                <span
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 ${
                    !isWithinTimeRange && !isPresent
                      ? "bg-gray-400"
                      : isPresent
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                ></span>
                {!isMobile && (isPresent ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> : <XCircle className="w-3 h-3 md:w-4 md:h-4" />)}
                <span className="text-xs md:text-sm whitespace-nowrap">{renderAttendanceText()}</span>
              </>
            )}
          </button>

          {/* WALLET */}
          <button
            onClick={handleWalletClick}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md flex items-center gap-1 md:gap-2 hover:scale-105 transition shrink-0 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            <Wallet className="w-3 h-3 md:w-4 md:h-4" />
            <span className={`font-semibold ${isMobile ? "text-xs" : "text-sm"}`}>
              {formatWalletBalance(walletBalance)}
            </span>
          </button>

          {/* THEME TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 md:p-2 rounded-md border shrink-0 ${
              darkMode ? "bg-gray-700 border-gray-600 text-yellow-400" : "bg-white border-gray-300"
            }`}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={() => navigate("/user/notification-page")}
            className={`relative p-1.5 md:p-2 rounded-full shrink-0 ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <Bell className={`w-4 h-4 md:w-5 md:h-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* PROFILE ICON */}
          <div ref={profileRef} className="shrink-0">
            <div
              ref={avatarRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center cursor-pointer text-white font-bold hover:scale-105 transition text-sm md:text-base"
            >
              {userInitial}
            </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN */}
      {showProfileMenu &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`rounded-md shadow-lg border py-1 ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              width: isMobile ? "10rem" : "12rem",
              zIndex: 100000,
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <button
              onClick={() => handleMenuClick("/user/profile-overview")}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <User className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="text-xs md:text-sm">Profile</span>
            </button>

            <button
              onClick={() => handleMenuClick("/user/query")}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="text-xs md:text-sm">User Query</span>
            </button>

            <button
              onClick={() => handleMenuClick("/user/wallet-withdrawl")}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Wallet className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="text-xs md:text-sm">Wallet</span>
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm w-full border-t ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700 border-gray-700"
                  : "text-gray-700 hover:bg-gray-100 border-gray-200"
              }`}
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="text-xs md:text-sm">Logout</span>
            </button>
          </div>,
          document.body
        )}

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
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
};

export default Navbar;