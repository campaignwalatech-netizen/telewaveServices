"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Zap, Target, Users } from "lucide-react"
import notificationService from "../../services/notificationService"
import userService from "../../services/userService"
import toast, { Toaster } from "react-hot-toast"

const Button = ({ children, className = "", onClick, variant = "default", disabled, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2"
  const variants = {
    default: "bg-[#4406CB] hover:bg-[#4406CB]/90 text-white disabled:opacity-50"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      onClick={onClick}
      disabled={disabled}
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

export default function HotOffersPage() {
  const navigate = useNavigate()
  const [offerTitle, setOfferTitle] = useState("")
  const [discount, setDiscount] = useState("")
  const [description, setDescription] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [selectedSegments, setSelectedSegments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])

  // Fetch all users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await userService.getAllUsers({
        page: 1,
        limit: 200,
        isActive: 'true'
      })

      if (response.success && response.data.users) {
        // Transform users data
        const transformedUsers = response.data.users.map(user => ({
          id: user._id,
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          phone: user.phoneNumber || 'N/A',
          category: categorizeUser(user),
          earnings: user.totalEarnings || 0,
          location: user.address || 'N/A',
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US'),
          lastActive: formatDate(user.updatedAt)
        }))

        setAllUsers(transformedUsers)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const categorizeUser = (user) => {
    const earnings = user.totalEarnings || 0
    const createdAt = new Date(user.createdAt)
    const now = new Date()
    const daysSinceJoin = (now - createdAt) / (1000 * 60 * 60 * 24)
    const updatedAt = new Date(user.updatedAt)
    const daysSinceActive = (now - updatedAt) / (1000 * 60 * 60 * 24)

    if (earnings > 30000) return 'high-earners'
    if (user.role === 'premium') return 'premium-users'
    if (daysSinceJoin <= 30) return 'new-users'
    if (daysSinceActive > 30) return 'inactive-users'
    return 'active-users'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 90000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US')
  }

  const segments = [
    { id: "all-users", label: "All Users", count: allUsers.length, description: "Send to all registered users" },
    { id: "active-users", label: "Active Users", count: allUsers.filter(u => u.category === "active-users").length, description: "Users active in last 7 days" },
    { id: "premium-users", label: "Premium Users", count: allUsers.filter(u => u.category === "premium-users").length, description: "Users with premium subscriptions" },
    { id: "new-users", label: "New Users", count: allUsers.filter(u => u.category === "new-users").length, description: "Users registered in last 30 days" },
    { id: "high-earners", label: "High Earners", count: allUsers.filter(u => u.category === "high-earners").length, description: "Users with earnings > ₹10,000" },
    { id: "inactive-users", label: "Inactive Users", count: allUsers.filter(u => u.category === "inactive-users").length, description: "Users inactive for 30+ days" },
  ]

  const getFilteredUsers = () => {
    let users = allUsers
    
    if (selectedSegments.includes("active-users")) {
      users = users.filter(u => u.category === "active-users" || selectedSegments.includes("all-users"))
    }
    if (selectedSegments.includes("premium-users")) {
      users = [...users, ...allUsers.filter(u => u.category === "premium-users")]
    }
    if (selectedSegments.includes("new-users")) {
      users = [...users, ...allUsers.filter(u => u.category === "new-users")]
    }
    if (selectedSegments.includes("high-earners")) {
      users = [...users, ...allUsers.filter(u => u.category === "high-earners")]
    }
    if (selectedSegments.includes("inactive-users")) {
      users = [...users, ...allUsers.filter(u => u.category === "inactive-users")]
    }
    if (selectedSegments.includes("all-users")) {
      users = allUsers
    }
    
    // Remove duplicates
    users = users.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    )
    
    // Apply search filter
    if (searchQuery) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      )
    }
    
    return users
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSegment = (id) => {
    setSelectedSegments((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const getTotalRecipients = () => {
    return selectedUsers.length > 0 ? selectedUsers.length : getFilteredUsers().length
  }

  const handleSend = async () => {
    if (!offerTitle.trim() || !discount.trim() || !description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const usersToSend = selectedUsers.length > 0 ? selectedUsers : getFilteredUsers().map(u => u.id)
    
    if (usersToSend.length === 0) {
      toast.error("Please select at least one segment or user to send notification")
      return
    }

    setIsLoading(true)
    
    try {
      const notificationData = {
        type: 'offer',
        title: offerTitle.trim(),
        message: description.trim(),
        recipients: usersToSend,
        targetSegments: selectedSegments,
        offerDetails: {
          offerTitle: offerTitle.trim(),
          discount: discount.trim(),
          expiryDate: expiryDate || null,
          description: description.trim()
        }
      }

      const response = await notificationService.sendNotification(notificationData)
      
      if (response.success) {
        setSent(true)
        toast.success(`Hot offer sent successfully to ${usersToSend.length} users!`)
        
        setTimeout(() => {
          setOfferTitle("")
          setDiscount("")
          setDescription("")
          setExpiryDate("")
          setSelectedSegments([])
          setSelectedUsers([])
          setSent(false)
        }, 3000)
      }
    } catch (err) {
      console.error('Error sending notification:', err)
      toast.error(err.message || 'Failed to send notification')
    } finally {
      setIsLoading(false)
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
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
          <button 
            onClick={() => navigate("/admin/notifications")} 
            className="inline-flex items-center gap-2 text-[#4406CB] hover:text-[#4406CB]/80 mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-[#4406CB]/10 p-2 sm:p-3">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-[#4406CB]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold break-words">Hot Offers Notifications</h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Send promotional offers to targeted user segments</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-12">
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-8">
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Create Hot Offer</h2>

              <div className="space-y-4 sm:space-y-6">
                {/* Offer Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Offer Title</label>
                  <Input
                    placeholder="e.g., Summer Sale - 50% Off"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Discount</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="50"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Expiry Date</label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Describe the offer details and terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-20 sm:min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Target Segments */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target User Segments - Bulk Notification
                  </label>
                  <div className="bg-[#4406CB]/10 border border-[#4406CB]/20 rounded-lg p-3 sm:p-4 mb-4">
                    <p className="text-xs sm:text-sm text-[#4406CB] font-medium">
                      📱 Bulk Hot Offers - Select multiple segments to send offers to thousands of users simultaneously
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {segments.map((segment) => (
                      <button
                        key={segment.id}
                        onClick={() => toggleSegment(segment.id)}
                        className={`rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                          selectedSegments.includes(segment.id)
                            ? "border-[#4406CB] bg-[#4406CB]/10 shadow-lg"
                            : "border-border bg-card hover:border-[#4406CB]/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-xs sm:text-sm">{segment.label}</p>
                          <span className={`text-base sm:text-lg font-bold ${
                            selectedSegments.includes(segment.id) ? "text-[#4406CB]" : "text-muted-foreground"
                          }`}>
                            {segment.count.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{segment.description}</p>
                        {selectedSegments.includes(segment.id) && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-[#4406CB] rounded-full"></div>
                            <span className="text-xs text-[#4406CB] font-medium">Selected for bulk notification</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Quick Select Options */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => setSelectedSegments(segments.map(s => s.id))}
                      className="px-3 py-1.5 bg-[#4406CB] text-white rounded-full text-xs font-medium hover:bg-[#4406CB]/90 transition-colors whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Select All ({segments.reduce((sum, s) => sum + s.count, 0).toLocaleString()} users)</span>
                      <span className="sm:hidden">Select All</span>
                    </button>
                    <button
                      onClick={() => setSelectedSegments([])}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-xs font-medium hover:bg-gray-600 transition-colors whitespace-nowrap"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setSelectedSegments(['active-users', 'premium-users', 'high-earners'])}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">High Value Users</span>
                      <span className="sm:hidden">Premium</span>
                    </button>
                  </div>
                </div>

                {/* Users List - Show when segments are selected */}
                {selectedSegments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users in Selected Segments ({getFilteredUsers().length})
                    </h3>
                    
                    {/* Search Users */}
                    <div className="mb-4">
                      <Input
                        placeholder="Search users by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Users List */}
                    <div className="grid gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
                      {getFilteredUsers().length > 0 ? (
                        getFilteredUsers().map((user) => (
                          <div
                            key={user.id}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedUsers.includes(user.id)
                                ? 'border-[#4406CB] bg-[#4406CB]/5'
                                : 'border-border hover:border-[#4406CB]/30'
                            }`}
                            onClick={() => toggleUserSelection(user.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{user.name}</h4>
                                <p className="text-xs text-muted-foreground">{user.email} • {user.phone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-[#4406CB]/10 text-[#4406CB] px-2 py-1 rounded">
                                    {user.category.replace('-', ' ')}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ₹{user.earnings.toLocaleString()} earnings
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.location}
                                  </span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedUsers.includes(user.id) 
                                  ? 'bg-[#4406CB] border-[#4406CB]' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedUsers.includes(user.id) && (
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No users found in selected segments
                        </p>
                      )}
                    </div>

                    {/* User Selection Controls */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
                      <button
                        onClick={() => setSelectedUsers(getFilteredUsers().map(u => u.id))}
                        className="px-3 py-1.5 bg-[#4406CB] text-white rounded text-xs font-medium hover:bg-[#4406CB]/90 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Select All Visible ({getFilteredUsers().length})</span>
                        <span className="sm:hidden">Select All</span>
                      </button>
                      <button
                        onClick={() => setSelectedUsers([])}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs font-medium hover:bg-gray-600 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Clear Selection</span>
                        <span className="sm:hidden">Clear</span>
                      </button>
                      {selectedUsers.length > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {selectedUsers.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-border">
                  {getTotalRecipients() > 0 && (
                    <div className="flex-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-3 sm:p-4 mb-2 sm:mb-4">
                      <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        🚀 Ready to send bulk notification
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        This will send hot offer "{offerTitle || 'your offer'}" to {getTotalRecipients().toLocaleString()} users
                        {selectedUsers.length > 0 ? " (individually selected)" : ` across ${selectedSegments.length} segment${selectedSegments.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleSend}
                    disabled={
                      isLoading ||
                      !offerTitle.trim() ||
                      !discount.trim() ||
                      !description.trim() ||
                      getTotalRecipients() === 0
                    }
                    className="w-full sm:min-w-48 sm:w-auto h-10 sm:h-12 text-sm sm:text-lg font-bold shadow-lg hover:shadow-xl justify-center"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    {isLoading 
                      ? `Sending to ${getTotalRecipients().toLocaleString()}...` 
                      : `Send to ${getTotalRecipients().toLocaleString()} Users`
                    }
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-700 dark:text-blue-400">
                          Sending bulk hot offer notification...
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-500">
                          Processing {getTotalRecipients().toLocaleString()} users across {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {sent && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-green-700">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">Bulk Hot Offer Sent Successfully! 🎉</p>
                        <p className="font-medium">
                          ✓ Notification delivered to {getTotalRecipients().toLocaleString()} users
                        </p>
                        <p className="text-sm mt-2">
                          Segments: {segments.filter(s => selectedSegments.includes(s.id)).map(s => s.label).join(', ')}
                        </p>
                        <div className="mt-3 p-3 bg-green-500/20 rounded-lg">
                          <p className="text-sm font-medium">📊 Delivery Summary:</p>
                          <ul className="text-sm mt-1 space-y-1">
                            <li>• Offer Title: "{offerTitle}"</li>
                            <li>• Discount: {discount}% off</li>
                            <li>• Total Recipients: {getTotalRecipients().toLocaleString()}</li>
                            <li>• Segments Targeted: {selectedSegments.length}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div>
            <Card className="p-4 sm:p-6 lg:sticky lg:top-6">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Offer Preview</h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Offer Card Preview */}
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-xs sm:text-sm break-words flex-1">{offerTitle || "Offer Title"}</p>
                    {discount && <span className="text-base sm:text-lg font-bold text-orange-500 ml-2">{discount}%</span>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2 break-words">
                    {description || "Offer description will appear here..."}
                  </p>
                  {expiryDate && <p className="text-xs text-muted-foreground">Expires: {expiryDate}</p>}
                </div>

                {/* Recipients Summary */}
                <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-3 sm:p-4">
                  <p className="text-xs text-muted-foreground mb-2">BULK NOTIFICATION REACH</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{getTotalRecipients().toLocaleString()}</p>
                  <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-400 mt-1">
                    {selectedSegments.length > 0
                      ? `${selectedSegments.length} segment${selectedSegments.length !== 1 ? "s" : ""} selected`
                      : "No segments selected"}
                  </p>
                  {getTotalRecipients() > 10000 && (
                    <div className="mt-2 p-2 bg-orange-500/20 rounded text-xs">
                      <p className="font-medium text-orange-800 dark:text-orange-300">
                        🚀 High Impact Freelancer - 10K+ users
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Segments */}
                {selectedSegments.length > 0 && (
                  <div className="rounded-lg border border-border p-4 max-h-48 overflow-y-auto">
                    <p className="text-xs font-medium mb-3 flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      TARGETED SEGMENTS ({selectedSegments.length})
                    </p>
                    <div className="space-y-2">
                      {segments
                        .filter((s) => selectedSegments.includes(s.id))
                        .map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex-1">
                              <p className="text-xs font-medium">{s.label}</p>
                              <p className="text-xs text-muted-foreground">{s.description}</p>
                            </div>
                            <span className="text-xs font-bold text-orange-600">
                              {s.count.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">Total Reach:</span>
                        <span className="text-sm font-bold text-orange-600">
                          {getTotalRecipients().toLocaleString()} users
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}