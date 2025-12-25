import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, Users, Wallet, User, ChevronLeft, ChevronRight, 
  Award, Bell, Calendar, Trophy, TrendingUp, Link, 
  BarChart, HelpCircle, Clock, CheckCircle, 
  FileText, CreditCard, List, Shield, Target, BarChart3
} from "lucide-react";

const Sidebar = ({ darkMode, isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
  // Main Sections
  { icon: Home, label: "Dashboard", path: "/user" },
  
  // Data Sections
  { icon: Target, label: "Today's Data", path: "/user/data-today" },
  { icon: Clock, label: "Previous Data", path: "/user/data-previous" },
  { icon: CheckCircle, label: "Closed Data", path: "/user/data-closed" },
  { icon: BarChart3, label: "Data Analytics", path: "/user/data-analytics" },
  
  // Legacy leads routes (for compatibility)
  { icon: Users, label: "All Accounts", path: "/user/all-leads" },
  
  // Work Analytics & Profile
  { icon: BarChart, label: "Work Analytics", path: "/user/work-analytics" },
  { icon: User, label: "Profile Details", path: "/user/profile-overview" },
  
  // Salary & Wallet
  { icon: Wallet, label: "Wallet", path: "/user/wallet-withdrawl" },
  
  // FAQ
  { icon: HelpCircle, label: "FAQ's", path: "/user/faqs" },
];

  const handleItemClick = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  const handleCollapse = () => {
    toggleSidebar();
  };

  // Group menu items for better organization (optional visual grouping)
  const groupedMenuItems = [
    {
      title: "Main",
      items: menuItems.slice(0, 1) // Dashboard only
    },
    {
      title: "Announcements",
      items: menuItems.slice(1, 3) // Announcement & Attendance
    },
    {
      title: "Leaderboards",
      items: menuItems.slice(3, 6) // Live Toppers, Leaderboard, Monthly Winner
    },
    {
      title: "Leads",
      items: menuItems.slice(6, 10) // All Leads, Today's Leads, Previous Leads, Closed Leads
    },
    {
      title: "Accounts",
      items: menuItems.slice(10, 14) // Account Link New, Pending, Approved, Completed
    },
    {
      title: "Analytics & Profile",
      items: menuItems.slice(14, 16) // Work Analytics, Profile Details
    },
    {
      title: "Finance",
      items: menuItems.slice(16, 18) // Salary Received, Wallet
    },
    {
      title: "Support",
      items: menuItems.slice(18) // FAQ's
    }
  ];

  return (
    <aside
      className={`fixed top-[64px] z-40 h-[calc(100%-64px)] transition-all duration-300 ease-in-out 
      ${isSidebarOpen ? "left-0 w-50" : "-left-full md:left-0 md:w-16"} 
      ${darkMode ? "bg-gray-900 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-gray-700" : "bg-gradient-to-b from-blue-50 via-white to-purple-50 border-gray-200"} 
      border-r shadow-lg`}
    >
      {/* Collapse Button - Hidden on mobile */}
      
      {/* Menu */}
      <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100%-64px)] md:h-[calc(100%-64px)]">
        {isSidebarOpen ? (
          // Render with groups when sidebar is open
          groupedMenuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {isSidebarOpen && group.items.length > 0 && (
                <div className={`px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider 
                  ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
                      ${
                        isActive
                          ? darkMode
                            ? "border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                            : "border-blue-600 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-300/50"
                          : darkMode
                          ? "text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                      }`}
                  >
                    <item.icon className="flex-shrink-0" size={18} />
                    <span className="text-sm font-medium text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          // Render without groups when sidebar is collapsed
          menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 
                  ${
                    isActive
                      ? darkMode
                        ? "border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                        : "border-blue-600 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-300/50"
                      : darkMode
                      ? "text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                  }`}
                title={!isSidebarOpen ? item.label : ""}
              >
                <item.icon className="flex-shrink-0" size={20} />
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;