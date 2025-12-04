import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Menu, Sun, Moon, LogOut, MessageCircle, Wallet, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import walletService from "../../services/walletService"; // <-- Added
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";

const Navbar = ({ darkMode, setDarkMode, toggleSidebar }) => {
  const user = useSelector(selectUser);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const [isPresent, setIsPresent] = useState(() => {
    const savedStatus = localStorage.getItem("attendanceStatus");
    return savedStatus === "present";
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  const profileRef = useRef(null);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
  // UPDATE DROPDOWN POSITION
  // ---------------------------
  useEffect(() => {
    if (showProfileMenu && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right - 10,
      });
    }
  }, [showProfileMenu]);

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
  // ATTENDANCE TOGGLE
  // ---------------------------
  const handleAttendanceToggle = () => {
    const newStatus = !isPresent;
    setIsPresent(newStatus);
    localStorage.setItem("attendanceStatus", newStatus ? "present" : "absent");
  };

  const formatWalletBalance = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
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
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full border-b transition-all duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-between px-4 py-3 w-full max-w-[100vw] overflow-x-hidden">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Menu toggle */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <Menu className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
          </button>

          {/* LOGO */}
          <div className="flex items-center gap-2 cursor-default select-none">
            <div className="w-8 h-8">
              <svg viewBox="0 0 1189 1189" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="594.5" cy="594.5" r="594.5" fill="#000"/>
                <circle cx="594.5" cy="594.5" r="534.5" fill="none" stroke="#fff" strokeWidth="40"/>
                <circle cx="594.5" cy="594.5" r="474.5" fill="none" stroke="#fff" strokeWidth="40"/>
                <text x="594.5" y="700" fontFamily="Georgia" fontSize="380" fill="#fff" textAnchor="middle" fontWeight="bold">CW</text>
              </svg>
            </div>
            <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Campaign<span className="text-black">wala</span>
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* STRONGER ATTENDANCE BUTTON */}
          <button
            onClick={handleAttendanceToggle}
            className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-semibold shadow-md transition-all border ${
              isPresent
                ? darkMode
                  ? "bg-green-900 border-green-700 text-gray-200 hover:bg-green-800"
                  : "bg-green-900 border-green-400 text-gray-100 hover:bg-green-800"
                : darkMode
                ? "bg-red-900 border-red-700 text-gray-100 hover:bg-red-800"
                : "bg-red-900 border-red-400 text-gray-100 hover:bg-red-800"
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                isPresent ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>

            {isPresent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Present
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Absent
              </>
            )}
          </button>

          {/* WALLET */}
          <button
            onClick={handleWalletClick}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 hover:scale-105 transition ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="font-semibold">{formatWalletBalance(walletBalance)}</span>
          </button>

          {/* THEME TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-md border ${
              darkMode ? "bg-gray-700 border-gray-600 text-yellow-400" : "bg-white border-gray-300"
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* NOTIFICATIONS */}
          <button
            onClick={() => navigate("/user/notification-page")}
            className={`relative p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <Bell className={darkMode ? "text-gray-300" : "text-gray-600"} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* PROFILE ICON */}
          <div ref={profileRef}>
            <div
              ref={avatarRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center cursor-pointer text-white font-bold hover:scale-105 transition"
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
              width: "12rem",
              zIndex: 100000,
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <button
              onClick={() => handleMenuClick("/user/profile-overview")}
              className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>

            <button
              onClick={() => handleMenuClick("/user/query")}
              className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <MessageCircle className="w-4 h-4" /> User Query
            </button>

            <button
              onClick={() => handleMenuClick("/user/wallet-withdrawl")}
              className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Wallet className="w-4 h-4" /> Wallet
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 text-sm w-full border-t ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700 border-gray-700"
                  : "text-gray-700 hover:bg-gray-100 border-gray-200"
              }`}
            >
              <LogOut className="w-4 h-4" /> Logout
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
      `}</style>
    </header>
  );
};

export default Navbar;
