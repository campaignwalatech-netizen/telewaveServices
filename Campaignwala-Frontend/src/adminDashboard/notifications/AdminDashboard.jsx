"use client"
import { useNavigate } from "react-router-dom"
import { Bell, Users, Zap, Clock } from "lucide-react"

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <div className="inline-flex rounded-lg bg-[#4406CB]/10 p-2 sm:p-3 flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#4406CB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold">Notification History</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">View all sent notifications and their status</p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-[#4406CB] font-medium group-hover:gap-2 sm:group-hover:gap-3 transition-all flex-shrink-0">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3 sm:pb-4">
                <div>
                  <p className="text-sm sm:text-base font-medium">Profile Completion Reminder</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sent to 234 users</p>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3 sm:pb-4">
                <div>
                  <p className="text-sm sm:text-base font-medium">Summer Sale - 50% Off</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sent to 1,245 users</p>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">1 day ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base font-medium">New Feature Announcement</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sent to 5,678 users</p>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}