import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./../components/Sidebar";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import notificationService from "../../services/notificationService";

function UserDashboardLayout({ darkMode, setDarkMode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications({
        page: 1,
        limit: 10
      });

      if (response.success && response.data.notifications) {
        const transformed = response.data.notifications.map(notif => {
          // Determine type based on notification type
          let notificationType = "info";
          if (notif.type === "offer") notificationType = "success";
          else if (notif.type === "profile") notificationType = "warning";
          else if (notif.status === "failed") notificationType = "warning";

          return {
            id: notif._id || notif.notificationId,
            title: notif.title,
            message: notif.message,
            type: notificationType,
            sentDate: notif.sentDate || notif.createdAt
          };
        });

        setNotifications(transformed);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (notifications.length === 0) return;

    const showNotificationPopup = () => {
      if (notifications.length === 0) return;
      
      const current = notifications[notificationIndex];
      setCurrentNotification(current);
      setShowNotification(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      // Move to next notification
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
    };

    // Show first notification after 2 seconds
    const initialTimeout = setTimeout(showNotificationPopup, 2000);

    // Show notification every 20 seconds
    const interval = setInterval(showNotificationPopup, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [notifications, notificationIndex]);

  const getNotificationStyles = () => {
    if (!currentNotification) return "";
    
    switch (currentNotification.type) {
      case "success":
        return darkMode
          ? "bg-green-900/90 border-green-700"
          : "bg-green-100 border-green-400";
      case "warning":
        return darkMode
          ? "bg-yellow-900/90 border-yellow-700"
          : "bg-yellow-100 border-yellow-400";
      case "info":
        return darkMode
          ? "bg-blue-900/90 border-blue-700"
          : "bg-blue-100 border-blue-400";
      default:
        return darkMode
          ? "bg-gray-800/90 border-gray-700"
          : "bg-white border-gray-300";
    }
  };

  const getNotificationIcon = () => {
    if (!currentNotification) return "";
    
    switch (currentNotification.type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  return (
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
  <Sidebar
    darkMode={darkMode}
    isSidebarOpen={isSidebarOpen}
    toggleSidebar={toggleSidebar}
  />

  <div className="flex-1 flex flex-col">
    {/* Navbar is fixed, full width */}
    <Navbar
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      toggleSidebar={toggleSidebar}
    />

    {/* Main content shifted only on desktop */}
    <main
      className={`p-4 min-h-screen pt-20 transition-all duration-300 ${
        isSidebarOpen ? "md:ml-52" : "md:ml-16"
      }`}
    >
      <Outlet />
    </main>

    <Footer darkMode={darkMode} />

</div>

      {/* Notification Popup */}
      {showNotification && currentNotification && (
        <div
          className={`fixed top-20 right-4 z-50 w-72 sm:w-80 md:w-96 p-3 sm:p-4 rounded-lg border-2 shadow-2xl transform transition-all duration-500 ${
            showNotification ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          } ${getNotificationStyles()}`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-base sm:text-xl md:text-2xl flex-shrink-0">
              {getNotificationIcon()}
            </span>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-semibold text-xs sm:text-sm md:text-base ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {currentNotification.title}
              </h4>
              <p
                className={`text-xs sm:text-sm mt-1 line-clamp-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {currentNotification.message}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className={`flex-shrink-0 text-sm sm:text-base ${
                darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboardLayout;