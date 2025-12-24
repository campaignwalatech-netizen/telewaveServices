import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, XCircle, Loader2 } from "lucide-react";
import notificationService from "../../services/notificationService";
import toast, { Toaster } from "react-hot-toast";

export default function TLNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 100,
        ...(filterType !== "all" && { type: filterType })
      };

      const response = await notificationService.getUserNotifications(params);
      
      if (response.success && response.data.notifications) {
        const transformed = response.data.notifications.map(notif => {
          const notificationId = notif._id || notif.notificationId;
          return {
            id: notificationId,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            sentDate: formatDate(notif.sentDate || notif.createdAt),
            notificationId: notificationId,
            offerDetails: notif.offerDetails,
            read: notificationService.isNotificationRead(notificationId)
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
  }, [filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  const getTypeColor = (type) => {
    switch (type) {
      case "profile":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "offer":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
      case "announcement":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
      case "system":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30";
    }
  };

  const filteredNotifications = filterType === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  const markAllRead = () => {
    const notificationIds = filteredNotifications.map(n => n.id);
    notificationService.markAllNotificationsAsRead(notificationIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id) => {
    notificationService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            </div>
            {filteredNotifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with your account activities</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "profile", "offer", "announcement", "system"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shrink-0 ${
                filterType === type
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-6 border-b last:border-b-0 border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                  !notification.read 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" 
                    : index === 0 ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    {notification.offerDetails && (
                      <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                          {notification.offerDetails.offerTitle}
                        </p>
                        {notification.offerDetails.discount && (
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Discount: {notification.offerDetails.discount}%
                          </p>
                        )}
                        {notification.offerDetails.expiryDate && (
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Expires: {new Date(notification.offerDetails.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                      {notification.sentDate}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No notifications found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {filterType === "all" 
                  ? "You're all caught up! No notifications to display." 
                  : `No ${filterType} notifications found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}