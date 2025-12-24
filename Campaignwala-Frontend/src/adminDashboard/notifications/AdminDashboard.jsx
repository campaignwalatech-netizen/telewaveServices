"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Users, Zap, Clock, Loader2 } from "lucide-react"
import notificationService from "../../services/notificationService"
import toast, { Toaster } from "react-hot-toast"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    recentCount: 0
  })

  useEffect(() => {
    fetchRecentNotifications()
    fetchStats()
  }, [])

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getAllNotifications({
        page: 1,
        limit: 5,
        sortBy: 'sentDate',
        order: 'desc'
      })

      if (response.success && response.data.notifications) {
        const transformed = response.data.notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          recipients: notif.recipientCount || 0,
          sentDate: formatDate(notif.sentDate || notif.createdAt)
        }))
        setRecentNotifications(transformed)
      }
    } catch (err) {
      console.error('Error fetching recent notifications:', err)
      toast.error('Failed to load recent notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await notificationService.getNotificationStats()
      if (response.success && response.data) {
        setStats({
          total: response.data.total || 0,
          recentCount: response.data.recentCount || 0
        })
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Admin Notification Center</h1>
          </div>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">Manage and send notifications to users</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-12">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Incomplete Profile Card */}
          <button onClick={() => navigate("/admin/notifications/incomplete-profile")}>
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 sm:p-8 transition-all hover:border-[#4406CB] hover:shadow-lg text-left">
              <div className="mb-3 sm:mb-4 inline-flex rounded-lg bg-[#4406CB]/10 p-2 sm:p-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#4406CB]" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Incomplete Profile</h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Send notifications to users who haven't completed their profile yet
              </p>
              <div className="mt-4 sm:mt-6 flex items-center gap-2 text-[#4406CB] font-medium group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Go to Page</span>
                <span>→</span>
              </div>
            </div>
          </button>

          {/* Hot Offers Card */}
          <button onClick={() => navigate("/admin/notifications/hot-offers")}>
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 sm:p-8 transition-all hover:border-[#4406CB] hover:shadow-lg text-left">
              <div className="mb-3 sm:mb-4 inline-flex rounded-lg bg-[#4406CB]/10 p-2 sm:p-3">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-[#4406CB]" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Hot Offers</h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Send promotional notifications about hot offers to selected users
              </p>
              <div className="mt-4 sm:mt-6 flex items-center gap-2 text-[#4406CB] font-medium group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Go to Page</span>
                <span>→</span>
              </div>
            </div>
          </button>
        </div>

        {/* History Button */}
        <div className="mt-8">
          <button 
            onClick={() => navigate("/admin/notifications/history")}
            className="w-full md:w-auto"
          >
            <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 sm:p-6 transition-all hover:border-[#4406CB] hover:shadow-lg text-left">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="inline-flex rounded-lg bg-[#4406CB]/10 p-2 sm:p-3 shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#4406CB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold">Notification History</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">View all sent notifications and their status</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-[#4406CB] font-medium group-hover:gap-2 sm:group-hover:gap-3 transition-all shrink-0">
                  <span className="text-sm sm:text-base whitespace-nowrap">View History</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Recent Notifications</h3>
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#4406CB]" />
                <span className="ml-2 text-muted-foreground">Loading notifications...</span>
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentNotifications.map((notif, index) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-center justify-between ${index < recentNotifications.length - 1 ? 'border-b border-border pb-3 sm:pb-4' : ''}`}
                  >
                    <div>
                      <p className="text-sm sm:text-base font-medium">{notif.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Sent to {notif.recipients.toLocaleString()} users</p>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{notif.sentDate}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent notifications</p>
                <button
                  onClick={() => navigate("/admin/notifications/history")}
                  className="mt-4 text-[#4406CB] hover:text-[#4406CB]/80 text-sm font-medium"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}