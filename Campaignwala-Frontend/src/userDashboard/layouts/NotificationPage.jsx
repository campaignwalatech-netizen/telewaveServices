import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";
import toast, { Toaster } from "react-hot-toast";

const NotificationsPage = ({ darkMode }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [activeCategory]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
        ...(activeCategory !== "All" && { type: activeCategory.toLowerCase() })
      };

      const response = await notificationService.getUserNotifications(params);
      
      if (response.success && response.data.notifications) {
        const transformed = response.data.notifications.map(notif => {
          const notificationId = notif._id || notif.notificationId;
          
          // Map notification type to category
          let category = "All";
          if (notif.type === "profile") category = "Profile";
          else if (notif.type === "offer") category = "Offer";
          else if (notif.type === "system") category = "Payment"; // Map system to Payment for UI

          // Determine type based on notification type and status
          let notificationType = "info";
          if (notif.type === "offer") notificationType = "success";
          else if (notif.status === "failed") notificationType = "warning";

          // Check if notification is read from localStorage
          const read = notificationService.isNotificationRead(notificationId);

          return {
            id: notificationId,
            category,
            title: notif.title,
            message: notif.message,
            time: formatDate(notif.sentDate || notif.createdAt),
            type: notificationType,
            read: read,
            notificationId: notificationId,
            offerDetails: notif.offerDetails
          };
        });

        setNotifications(transformed);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const categories = ["All", "Payment", "Profile", "Offer"];

  const markAllRead = () => {
    const notificationIds = notifications.map(n => n.id);
    notificationService.markAllNotificationsAsRead(notificationIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('notificationsMarkedAsRead'));
    
    // Also trigger storage event manually for same-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'readNotifications',
      newValue: localStorage.getItem('readNotifications')
    }));
    
    toast.success('All notifications marked as read');
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1f2937' : '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
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
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shrink-0 ${
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
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Loading notifications...
              </h3>
            </div>
          ) : filteredNotifications.length > 0 ? (
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
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-lg sm:text-xl font-semibold shrink-0 ${typeColors[notification.type]}`}
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
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></span>
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