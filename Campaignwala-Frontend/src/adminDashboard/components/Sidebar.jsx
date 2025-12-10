import { 
  X, Users, FileText, Upload, TrendingUp, CheckCircle, 
  MessageSquare, Package, DollarSign, BarChart3, Shield,
  Settings, LogOut, UserPlus, ClipboardList, Target,
  Award, Bell, Key, Activity, Database, Filter,
  Calendar, Clock, Star, TrendingDown, RefreshCw,
  ChevronDown, ChevronRight, Home, Grid, LayoutDashboard, MoreVertical,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import userService from "../../services/userService";

export default function AdminSidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  userPhone,
  handleLogout 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardStats, setDashboardStats] = useState({
    pendingLeads: 0,
    activeHR: 0,
    pendingApprovals: 0,
    todayLeads: 0
  });
  const [expandedSections, setExpandedSections] = useState({
    manageLeads: false,
    manageAccount: false,
    teamMember: false,
    convertedLeads: false,
    miscellaneous: false
  });

  // Fetch dashboard stats for sidebar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getDashboardStats();
        if (response.success && response.data) {
          const { leadStats, userStats, pendingActions } = response.data;
          setDashboardStats({
            pendingLeads: leadStats?.pending || 0,
            activeHR: userStats?.active || 0,
            pendingApprovals: pendingActions?.kycApprovals || 0,
            todayLeads: leadStats?.today || 0
          });
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuStructure = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
      type: "single",
      badge: null
    },
    {
  id: "manageDataLeads",
  label: "Manage Data Leads",
  icon: FileText,
  type: "section",
  badge: dashboardStats.pendingData > 0 ? dashboardStats.pendingData : null,
  items: [
    { id: "data-dashboard", label: "Data Dashboard", icon: BarChart3, path: "/admin/data/dashboard" },
    { id: "distribute-data", label: "Distribute Data", icon: TrendingUp, path: "/admin/data/distribute" },
    { id: "upload-data", label: "Upload Fresh data", icon: Upload, path: "/admin/data/upload" },
    { id: "not-used", label: "Not Used", icon: Filter, path: "/admin/data/not-used" },
    { id: "today-assigned", label: "Today Assigned", icon: Calendar, path: "/admin/data/today-assigned", badge: dashboardStats.todayLeads },
    { id: "called", label: "Called", icon: Bell, path: "/admin/data/called" },
    { id: "closed", label: "Closed", icon: CheckCircle, path: "/admin/data/closed" },
    { id: "feedback-analytics", label: "Data Feedback Analytics", icon: MessageSquare, path: "/admin/data/analytics/feedback" },
    { id: "new", label: "New", icon: RefreshCw, path: "/admin/data/new" }, 
  ]
},
    {
      id: "manageOffers",
      label: "Manage Offers",
      icon: Users,
      type: "section",
      items: [
        { id: "all-offers", label: "All Offers", icon: Package, path: "/admin/all-Offers", },
        { id: "add-offers", label: "Add Offers", icon: Grid, path: "/admin/add-Offers", },
        { id: "approve-offers", label: "Approve Offers", icon: Database, path: "/admin/approve-offers" },
        
      ]
    },
    {
      id: "convertedLeads",
      label: "Converted Leads",
      icon: Target,
      type: "section",
      items: [
        { id: "abc-analytics", label: "Account Analytics", icon: BarChart3, path: "/admin/abc-analytics" },
        { id: "leads-pending", label: "Pending", icon: Clock, path: "/admin/leads-pending" },
        { id: "leads-approved", label: "Approved", icon: CheckCircle, path: "/admin/leads-approved" },
        { id: "leads-completed", label: "Completed", icon: CheckCircle, path: "/admin/leads-completed" },
        { id: "leads-rejected", label: "Rejected", icon: CheckCircle, path: "/admin/leads-rejected" },
      ]
    },
    {
      id: "teamMember",
      label: "Team Member",
      icon: Users,
      type: "section",
      badge: dashboardStats.activeHR,
      items: [
        
        { id: "present-users", label: "Present HR", icon: Users, path: "/admin/present-users" },
        { id: "all-tl", label: "Team Leaders", icon: Award, path: "/admin/all-tl" },
        { id: "hr", label: "HR", icon: UserPlus, path: "/admin/all-users" },
        { id: "leaderboard", label: "Leaderboard", icon: TrendingUp, path: "/admin/team/leaderboard" },
        { id: "live-toppers", label: "Live Toppers List", icon: Star, path: "/admin/team/toppers" },
        { id: "monthly-winners", label: "Monthly Winner List", icon: Award, path: "/admin/team/winners" },
        { id: "not-approved-hr", label: "Not Approved HR", icon: Shield, path: "/admin/not-approved" },
        { id: "all-ex-users", label: "All Ex Users", icon: Shield, path: "/admin/all-ex-users" },
      ]
    },
    {
      id: "manage-category",
      label: "Manage Category",
      icon: Grid,
      type: "section",
      items: [
        { id: "all-category", label: "All Categories", icon: Package, path: "/admin/all-category", },
        { id: "add-category", label: "Add Categories", icon: Grid, path: "/admin/add-category", },
       
      ]
    },
    
    {
      id: "slideboard",
      label: "Slide Board",
      icon: LayoutDashboard,
      type: "section",
      badge: dashboardStats.activeHR,
      items: [
        { id: "all-slides", label: "All Slides", icon: LayoutDashboard, path: "/admin/all-slides" },
        { id: "add-slide", label: "Add Slide", icon: LayoutDashboard, path: "/admin/add-slide" },
      ]
    },
    {
      id: "payment-withdrawal",
      label: "Payment Withdrawal List",
      icon: Package,
      type: "section",
      badge: dashboardStats.activeHR,
      items: [
        { id: "payment-withdrawal", label: "Payment Withdrawal List", icon: LayoutDashboard, path: "/admin/payment-withdrawal" },
      ]
    },
    
    {
      id: "miscellaneous",
      label: "Miscellaneous",
      icon: Settings,
      type: "section",
      items: [
        { id: "reset-password", label: "Reset Password", icon: Key, path: "/admin/reset-password" },
        { id: "add-team-leader", label: "Admin Activity Logs", icon: MoreVertical, path: "/admin/admin-logs" },
        { id: "salary-distributed", label: "Salary Distributed", icon: DollarSign, path: "/admin/misc/salary" },
        { id: "activity-logs", label: "Activity Logs", icon: Activity, path: "/admin/misc/activity-logs" },
        { id: "tw-database", label: "TW Database", icon: Database, path: "/admin/misc/tw-database" },
      ]
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      path: "/admin/settings",
      type: "single",
      badge: null
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path || 
                    (item.items && item.items.some(subItem => location.pathname === subItem.path));
    
    if (item.type === "section") {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleSection(item.id)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${
                isActive 
                  ? "bg-white/20" 
                  : "bg-gray-100 dark:bg-gray-800"
              }`}>
                <item.icon size={16} className={isActive ? "text-white" : "text-gray-600 dark:text-gray-400"} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.badge && (
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  isActive
                    ? "bg-white text-blue-700"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                }`}>
                  {item.badge}
                </span>
              )}
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${
                  expandedSections[item.id] ? "rotate-180" : ""
                } ${isActive ? "text-white" : "text-gray-400"}`}
              />
            </div>
          </button>
          
          {expandedSections[item.id] && item.items && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-3">
              {item.items.map(subItem => (
                <button
                  key={subItem.id}
                  onClick={() => handleNavigation(subItem.path)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    location.pathname === subItem.path
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <subItem.icon size={14} />
                    <span className="text-sm font-medium">{subItem.label}</span>
                  </div>
                  {subItem.badge && (
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                      location.pathname === subItem.path
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {subItem.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${
            isActive 
              ? "bg-white/20" 
              : "bg-gray-100 dark:bg-gray-800"
          }`}>
            <item.icon size={16} className={isActive ? "text-white" : "text-gray-600 dark:text-gray-400"} />
          </div>
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        {item.badge && (
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
            isActive
              ? "bg-white text-blue-700"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static border-r border-gray-200 dark:border-gray-800`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lead Management System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {menuStructure.map(renderMenuItem)}
          </div>
        </nav>

        {/* Quick Stats & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <TrendingUp size={12} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Today's Leads</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{dashboardStats.todayLeads}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{dashboardStats.pendingApprovals}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">System Status</span>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Logout</span>
          </button>

          {/* Version Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">v2.5.1 • © 2024</p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </aside>
  );
}