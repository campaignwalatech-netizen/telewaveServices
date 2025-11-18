import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context-api/ThemeContext";
import { TrendingUp, DollarSign, UserPlus, Activity, Users } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatsCard from "../components/StatsCard";
import ActivityFeed from "../components/ActivityFeed";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userPhone = localStorage.getItem("userPhone");

  useEffect(() => {
    // Check if user is logged in and is an admin
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userType = localStorage.getItem("userType");
    
    if (!isLoggedIn || userType !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userType");
    navigate("/");
  };

  // Stats data
  const stats = [
    {
      title: "Total Revenue",
      value: "₹45,231",
      change: "+20.1%",
      icon: DollarSign,
      color: "bg-blue-500",
    },
    {
      title: "Total Users",
      value: "2,350",
      change: "+15.3%",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Active Campaigns",
      value: "128",
      change: "+8.5%",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "New Leads",
      value: "573",
      change: "+12.7%",
      icon: UserPlus,
      color: "bg-orange-500",
    },
  ];

  // Recent activity data
  const recentActivities = [
    { id: 1, user: "John Doe", action: "Created new campaign", time: "2 hours ago" },
    { id: 2, user: "Jane Smith", action: "Updated lead status", time: "4 hours ago" },
    { id: 3, user: "Mike Johnson", action: "Completed task", time: "5 hours ago" },
    { id: 4, user: "Sarah Williams", action: "Added new product", time: "6 hours ago" },
    { id: 5, user: "Tom Brown", action: "Sent email campaign", time: "8 hours ago" },
  ];

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar Component */}
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userPhone={userPhone}
        handleLogout={handleLogout}
      />        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Component */}
          <AdminHeader setSidebarOpen={setSidebarOpen} />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} stat={stat} />
              ))}
            </div>

            {/* Charts and Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Placeholder */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Sales Overview
                </h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <Activity size={48} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Chart will be displayed here
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Component */}
              <ActivityFeed activities={recentActivities} />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
