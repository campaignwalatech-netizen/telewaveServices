import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = ({ darkMode }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    // Payment notifications
    {
      id: 1,
      category: "Payment",
      title: "Withdrawal Request Approved",
      message: "Your withdrawal request of ₹5,000 has been approved and will be credited soon.",
      time: "1 hour ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      category: "Payment",
      title: "Withdrawal Request Pending",
      message: "Your withdrawal request of ₹2,000 is pending approval.",
      time: "2 hours ago",
      type: "warning",
      read: false,
    },

    // Profile notifications
    {
      id: 3,
      category: "Profile",
      title: "KYC Confirmed",
      message: "Your KYC details have been confirmed by the system.",
      time: "1 day ago",
      type: "info",
      read: true,
    },
    {
      id: 4,
      category: "Profile",
      title: "KYC Approved",
      message: "Your KYC has been approved by admin. You can now make transactions.",
      time: "2 days ago",
      type: "success",
      read: false,
    },
    {
      id: 5,
      category: "Profile",
      title: "KYC Rejected",
      message: "Your KYC documents were rejected. Please resubmit correct documents.",
      time: "3 days ago",
      type: "warning",
      read: false,
    },
    {
      id: 7,
      category: "Payment",
      title: "KYC Verification Pending",
      message: "Your KYC verification is pending. Please upload your documents for review.",
      time: "4 hours ago",
      type: "warning",
      read: false,
    },

    // Offer notifications
    {
      id: 6,
      category: "Offer",
      title: "New Offer Available!",
      message: "Get 20% cashback on your next transaction.",
      time: "3 days ago",
      type: "success",
      read: false,
    },
  ]);

  const categories = ["All", "Payment", "Profile", "Offer"];

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeColors = {
    success: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    warning: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    info: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const filteredNotifications = activeCategory === "All" 
    ? notifications 
    : notifications.filter((n) => n.category === activeCategory);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className={`min-h-screen pt-6 lg:pt-8 pb-6 transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? "bg-gray-800 text-white hover:bg-gray-700" 
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
              aria-label="Go back"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </button>
            
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Notifications
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Stay updated with your account activities
              </p>
            </div>
          </div>
          
          <button
            onClick={markAllRead}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 whitespace-nowrap ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : darkMode
                  ? "bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm"
              }`}
            >
              {cat === "All" ? "📢 All" : `${cat} Related`}
            </button>
          ))}
        </div>

        {/* Notifications Count */}
        <div className="mb-4">
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </p>
        </div>

        {/* Notifications List */}
        <div
          className={`rounded-2xl shadow-sm ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex justify-between items-start p-4 sm:p-6 border-b last:border-b-0 transition-all duration-200 ${
                  notification.read
                    ? darkMode
                      ? "bg-gray-800"
                      : "bg-white"
                    : darkMode
                    ? "bg-blue-900/20 border-l-4 border-l-blue-500"
                    : "bg-blue-50 border-l-4 border-l-blue-500"
                } ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Notification Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-lg sm:text-xl font-semibold flex-shrink-0 ${typeColors[notification.type]}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"} truncate`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed break-words ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                No notifications found
              </h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {activeCategory === "All" 
                  ? "You're all caught up! No notifications to display." 
                  : `No ${activeCategory.toLowerCase()} notifications found.`}
              </p>
            </div>
          )}
        </div>

        {/* Unread Count Summary */}
        {activeCategory === "All" && (
          <div className="mt-6">
            <div className={`text-center p-4 rounded-lg ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              <p className="text-sm">
                You have {notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar hiding */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;