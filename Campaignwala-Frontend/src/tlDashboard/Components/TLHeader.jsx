import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  BarChart3,
  Users,
  TrendingUp
} from "lucide-react";
import {
  selectUser,
  logoutUser,
  logoutUserAsync
} from "../../redux/slices/authSlice";

/**
 * TL Header Component
 * Header for Team Leader dashboard
 */
export default function TLHeader({ isDark, onThemeToggle, onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useSelector(selectUser);

  // Fetch notifications (simulated)
  useEffect(() => {
    const simulatedNotifications = [
      { id: 1, title: "New lead assigned", message: "You have a new lead from John", time: "5 min ago", read: false },
      { id: 2, title: "Team member activity", message: "Sarah completed 3 leads today", time: "1 hour ago", read: false },
      { id: 3, title: "Performance update", message: "Team conversion rate improved by 15%", time: "2 hours ago", read: true },
      { id: 4, title: "New team member", message: "New member joined your team", time: "1 day ago", read: true },
    ];
    setNotifications(simulatedNotifications);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleQuickActions = (action) => {
    switch(action) {
      case 'assign':
        console.log("Assign lead");
        break;
      case 'approve':
        console.log("Approve lead");
        break;
      case 'report':
        console.log("Generate report");
        break;
      default:
        break;
    }
  };

  // Defensive clear of localStorage keys used for auth
  const clearClientAuthStorage = useCallback(() => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userPhone');
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
  }, []);

  // Unified logout handler:
  // - If onLogout prop exists, call it (await if async)
  // - Else call logoutUserAsync thunk; fallback to sync logoutUser on error
  // - Always clear localStorage, reset redux state and navigate to /login
  const handleLogout = useCallback(async () => {
    setShowProfileMenu(false);
    console.log("TLHeader: starting logout...");

    // First try the prop if provided
    if (typeof onLogout === "function") {
      try {
        console.log("TLHeader: calling provided onLogout prop...");
        // await in case it's async
        await onLogout();
      } catch (err) {
        console.error("TLHeader: onLogout prop threw an error:", err);
        // continue to ensure client state cleared
      } finally {
        clearClientAuthStorage();
        // Ensure redux cleared
        try {
          dispatch(logoutUser());
        } catch (e) {
          console.warn("TLHeader: dispatch(logoutUser) failed:", e);
        }
        // Navigate to login (defensive)
        navigate("/login");
      }
      return;
    }

    // If no prop, use redux thunk
    try {
      console.log("TLHeader: dispatching logoutUserAsync...");
      // unwrap would throw on rejection if used, but it's optional — we'll handle errors explicitly
      const resultAction = await dispatch(logoutUserAsync());
      // if the thunk returned a rejected action, resultAction.error will exist
      if (resultAction?.error) {
        console.warn("TLHeader: logoutUserAsync returned error:", resultAction.error);
        // fallback to sync reducer to ensure client cleared
        dispatch(logoutUser());
      }
    } catch (err) {
      console.error("TLHeader: logoutUserAsync dispatch failed:", err);
      // fallback to sync reducer
      try {
        dispatch(logoutUser());
      } catch (e) {
        console.warn("TLHeader: fallback dispatch(logoutUser) failed:", e);
      }
    } finally {
      clearClientAuthStorage();
      // Navigate to login
      navigate("/login");
    }
  }, [onLogout, dispatch, navigate, clearClientAuthStorage]);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Quick Stats */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads, team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 w-full text-center">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || "Team Leader"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team Leader</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.name || "Team Leader"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || "tl@example.com"}
                      </p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Navigate to profile - keep nav outside this component if preferred
                          navigate("/profile");
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Navigate to settings
                          navigate("/settings");
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Show help
                          navigate("/help");
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Help & Support</span>
                      </button>
                    </div>
                    <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        
      </div>
    </header>
  );
}
