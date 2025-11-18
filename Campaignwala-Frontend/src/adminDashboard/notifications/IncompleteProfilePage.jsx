"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Users, Search, Filter, CheckCircle, XCircle, Eye, Mail, Phone, Calendar } from "lucide-react"
import notificationService from "../../services/notificationService"
import userService from "../../services/userService"

const Button = ({ children, className = "", onClick, disabled, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2"
  const variants = "bg-[#4406CB] hover:bg-[#4406CB]/90 text-white disabled:opacity-50"
  
  return (
    <button 
      className={`${baseClasses} ${variants} ${className}`} 
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

export default function IncompleteProfilePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("Complete Your Profile")
  const [message, setMessage] = useState("Complete your profile to unlock all features and get better opportunities.")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [filterBy, setFilterBy] = useState("all")
  const [incompleteUsers, setIncompleteUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Fetch users with incomplete profiles
  useEffect(() => {
    fetchIncompleteUsers()
  }, [])

  const fetchIncompleteUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await userService.getAllUsers({
        page: 1,
        limit: 100,
        isActive: 'true'
      })

      if (response.success && response.data.users) {
        // Transform users data to match UI format
        const transformedUsers = response.data.users
          .filter(user => {
            // Filter users with incomplete KYC or missing basic info
            return !user.kyc?.isVerified || !user.name || !user.email
          })
          .map(user => ({
            id: user._id,
            name: user.name || 'N/A',
            email: user.email || 'N/A',
            phone: user.phoneNumber || 'N/A',
            joinDate: new Date(user.createdAt).toLocaleDateString('en-US'),
            missingFields: getMissingFields(user),
            completionPercent: calculateCompletion(user),
            lastActive: formatDate(user.updatedAt)
          }))

        setIncompleteUsers(transformedUsers)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      alert('Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const getMissingFields = (user) => {
    const missing = []
    if (!user.profilePicture) missing.push('profile_pic')
    if (!user.address) missing.push('address')
    if (!user.kyc?.panCard) missing.push('pan_card')
    if (!user.kyc?.bankDetails?.accountNumber) missing.push('bank_details')
    if (!user.kyc?.isVerified) missing.push('kyc_documents')
    return missing
  }

  const calculateCompletion = (user) => {
    let completed = 0
    const total = 10
    
    if (user.name) completed++
    if (user.email) completed++
    if (user.phoneNumber) completed++
    if (user.profilePicture) completed++
    if (user.address) completed++
    if (user.kyc?.panCard) completed++
    if (user.kyc?.aadharCard) completed++
    if (user.kyc?.bankDetails?.accountNumber) completed++
    if (user.kyc?.isVerified) completed += 2
    
    return Math.round((completed / total) * 100)
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

  const fieldLabels = {
    profile_pic: "Profile Picture",
    address: "Address Details",
    pan_card: "PAN Card", 
    bank_details: "Bank Details",
    kyc_documents: "KYC Documents"
  }

  const filteredUsers = incompleteUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery)
    
    const matchesFilter = filterBy === "all" ||
                         (filterBy === "high" && user.completionPercent < 50) ||
                         (filterBy === "medium" && user.completionPercent >= 50 && user.completionPercent < 75) ||
                         (filterBy === "low" && user.completionPercent >= 75)
    
    return matchesSearch && matchesFilter
  })

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(user => user.id))
  }

  const clearAll = () => {
    setSelectedUsers([])
  }

  const getCompletionColor = (percent) => {
    if (percent < 50) return "text-red-500"
    if (percent < 75) return "text-yellow-500"
    return "text-green-500"
  }

  const getCompletionBg = (percent) => {
    if (percent < 50) return "bg-red-500/10 border-red-500/20"
    if (percent < 75) return "bg-yellow-500/10 border-yellow-500/20"
    return "bg-green-500/10 border-green-500/20"
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please fill in both title and message")
      return
    }

    if (selectedUsers.length === 0) {
      alert("Please select at least one user to send notification")
      return
    }

    setIsLoading(true)
    
    try {
      const notificationData = {
        type: 'profile',
        title: title.trim(),
        message: message.trim(),
        recipients: selectedUsers,
        filterBy: filterBy,
        searchQuery: searchQuery,
        selectedUserIds: selectedUsers
      }

      const response = await notificationService.sendNotification(notificationData)
      
      if (response.success) {
        setSent(true)
        alert(`Notification sent successfully to ${selectedUsers.length} users!`)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSent(false)
          setSelectedUsers([])
          setTitle("Complete Your Profile")
          setMessage("Complete your profile to unlock all features and get better opportunities.")
        }, 3000)
      }
    } catch (err) {
      console.error('Error sending notification:', err)
      alert(err.message || 'Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6">
          <button 
            onClick={() => navigate("/admin/notifications")} 
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 sm:p-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold break-words">Incomplete Profile Notifications</h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Send reminders to users to complete their profiles</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Users List - Left Side */}
          <div className="lg:col-span-2">
            <Card className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">Incomplete Profile Users ({incompleteUsers.length})</h2>
                <div className="flex items-center gap-2">
                  {selectedUsers.length > 0 && (
                    <span className="text-xs sm:text-sm text-muted-foreground bg-[#4406CB]/10 px-2 sm:px-3 py-1 rounded-full">
                      {selectedUsers.length} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-fit">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select 
                    value={filterBy} 
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm w-fit whitespace-nowrap"
                  >
                    <option value="all">All Users</option>
                    <option value="high">High Priority (&lt;50%)</option>
                    <option value="medium">Medium (50-75%)</option>
                    <option value="low">Low Priority (&gt;75%)</option>
                  </select>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                <Button onClick={selectAll} variant="outline" size="sm" className="text-xs sm:text-sm w-auto">
                  Select All ({filteredUsers.length})
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm" className="text-xs sm:text-sm w-auto">
                  Clear All
                </Button>
              </div>

              {/* Users List */}
              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedUsers.includes(user.id)
                        ? 'border-[#4406CB] bg-[#4406CB]/5'
                        : 'border-border hover:border-[#4406CB]/50'
                    }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Checkbox */}
                      <div className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center ${
                        selectedUsers.includes(user.id) 
                          ? 'bg-[#4406CB] border-[#4406CB]' 
                          : 'border-gray-300'
                      }`}>
                        {selectedUsers.includes(user.id) && (
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold">{user.name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs font-medium w-fit ${getCompletionBg(user.completionPercent)}`}>
                            <span className={getCompletionColor(user.completionPercent)}>
                              {user.completionPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Missing Fields */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {user.missingFields.map((field) => (
                            <span key={field} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded">
                              {fieldLabels[field]}
                            </span>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              user.completionPercent < 50 ? 'bg-red-500' :
                              user.completionPercent < 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${user.completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Notification Form - Right Side */}
          <div>
            <Card className="p-4 sm:p-6 lg:sticky lg:top-6">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Send Notification</h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Selected Users Count */}
                <div className="rounded-lg bg-[#4406CB]/10 p-3 sm:p-4 border border-[#4406CB]/20">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Selected Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#4406CB]">{selectedUsers.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedUsers.length === 0 ? "No users selected" : "users will receive notification"}
                  </p>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Title</label>
                  <Input
                    placeholder="Notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Notification message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full min-h-20 sm:min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Preview */}
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-2">PREVIEW</p>
                  <div className="space-y-1">
                    <p className="font-bold text-xs sm:text-sm">{title || "Title"}</p>
                    <p className="text-xs text-muted-foreground break-words">{message || "Message"}</p>
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !title.trim() || !message.trim() || selectedUsers.length === 0}
                  className="w-full justify-center text-xs sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  {isLoading ? "Sending..." : `Send to ${selectedUsers.length} Users`}
                </Button>

                {/* Success Message */}
                {sent && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-green-700">
                    <p className="font-medium text-xs sm:text-sm">✓ Sent to {selectedUsers.length} users!</p>
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