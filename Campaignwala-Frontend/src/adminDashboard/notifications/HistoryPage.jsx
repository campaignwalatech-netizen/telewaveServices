"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, Search, Trash2, Eye } from "lucide-react"
import notificationService from "../../services/notificationService"
import toast, { Toaster } from "react-hot-toast"

const Button = ({ children, className = "", onClick, variant = "default", ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
  const variants = {
    default: "bg-[#4406CB] hover:bg-[#4406CB]/90 text-white",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      onClick={onClick} 
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  )
}

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 0
  })

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications()
  }, [filterType, searchQuery, pagination.page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        type: filterType,
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'sentDate',
        order: 'desc'
      }

      const response = await notificationService.getAllNotifications(params)
      
      if (response.success) {
        // Transform API data to match UI format
        const transformedNotifications = response.data.notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          type: notif.type,
          recipients: notif.recipientCount || 0,
          sentDate: formatDate(notif.sentDate),
          status: notif.status,
          message: notif.message,
          offerDetails: notif.offerDetails,
          notificationId: notif.notificationId
        }))
        
        setNotifications(transformedNotifications)
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }))
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 90000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
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

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || notif.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this notification?')
      if (!confirmed) return

      const response = await notificationService.deleteNotification(id)
      
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        setSelectedNotification(null)
        toast.success('Notification deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      toast.error(err.message || 'Failed to delete notification')
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "profile":
        return "bg-[#4406CB]/10 text-[#4406CB] border-[#4406CB]/30"
      case "offer":
        return "bg-[#4406CB]/10 text-[#4406CB] border-[#4406CB]/30"
      case "announcement":
        return "bg-[#4406CB]/10 text-[#4406CB] border-[#4406CB]/30"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/30"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-500/10 text-green-700"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700"
      case "failed":
        return "bg-red-500/10 text-red-700"
      default:
        return "bg-gray-500/10 text-gray-700"
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
        <div className="mx-auto max-w-6xl px-6 py-6">
          <button 
            onClick={() => navigate("/admin/notifications")} 
            className="inline-flex items-center gap-2 text-[#4406CB] hover:text-[#4406CB]/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#4406CB]/10 p-3">
              <Clock className="h-6 w-6 text-[#4406CB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notification History</h1>
              <p className="mt-1 text-muted-foreground">View and manage all sent notifications</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* List Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Notifications</h2>

              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filterType === "all"
                        ? "bg-[#4406CB] text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("profile")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filterType === "profile"
                        ? "bg-[#4406CB] text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setFilterType("offer")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filterType === "offer"
                        ? "bg-[#4406CB] text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Offers
                  </button>
                  <button
                    onClick={() => setFilterType("announcement")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filterType === "announcement"
                        ? "bg-[#4406CB] text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Announcements
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4406CB] mx-auto"></div>
                    <p className="mt-2">Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    <p>Error: {error}</p>
                    <button 
                      onClick={fetchNotifications}
                      className="mt-2 text-[#4406CB] hover:text-[#4406CB]/80 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => setSelectedNotification(notif)}
                      className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                        selectedNotification?.id === notif.id
                          ? "border-[#4406CB] bg-[#4406CB]/5"
                          : "border-border hover:border-[#4406CB]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm flex-1">{notif.title}</p>
                        <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{notif.sentDate}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notif.recipients} recipients</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(notif.status)}`}>
                          {notif.status}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No notifications found</p>
                )}
              </div>
            </Card>
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-2">
            {selectedNotification ? (
              <Card className="p-6 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold">{selectedNotification.title}</h3>
                  <button
                    onClick={() => handleDelete(selectedNotification.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type Badge */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">TYPE</p>
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded border ${getTypeColor(selectedNotification.type)}`}
                    >
                      {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">STATUS</p>
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded ${getStatusColor(selectedNotification.status)}`}
                    >
                      {selectedNotification.status.charAt(0).toUpperCase() + selectedNotification.status.slice(1)}
                    </span>
                  </div>

                  {/* Recipients */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">RECIPIENTS</p>
                    <p className="text-2xl font-bold">{selectedNotification.recipients}</p>
                  </div>

                  {/* Sent Date */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SENT DATE</p>
                    <p className="text-sm">{selectedNotification.sentDate}</p>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">MESSAGE</p>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm leading-relaxed">{selectedNotification.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button onClick={() => handleDelete(selectedNotification.id)} variant="outline" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 sticky top-6 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a notification to view details</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}