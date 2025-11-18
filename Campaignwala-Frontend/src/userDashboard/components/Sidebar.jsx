import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Wallet, User, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ darkMode, isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/user" },
    { icon: Users, label: "All Leads", path: "/user/all-leads" },
    { icon: Wallet, label: "Wallet", path: "/user/wallet-withdrawl" },
    { icon: User, label: "Profile", path: "/user/profile-overview" },
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

  return (
    <aside
      className={`fixed top-[64px] z-40 h-[calc(100%-64px)] transition-all duration-300 ease-in-out 
      ${isSidebarOpen ? "left-0 w-52" : "-left-full md:left-0 md:w-16"} 
      ${darkMode ? "bg-gray-900 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-gray-700" : "bg-gradient-to-b from-blue-50 via-white to-purple-50 border-gray-200"} 
      border-r shadow-lg`}
    >
      {/* Collapse Button - Hidden on mobile */}
      <div
        className={`p-3 border-b hidden md:flex items-center justify-end 
        ${darkMode ? "border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20" : "border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100"}`}
      >
        <button
          onClick={handleCollapse}
          className={`p-2 rounded-md transition-colors 
          ${darkMode ? "text-blue-400 hover:bg-gray-800" : "text-blue-600 hover:bg-blue-200"}`}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100%-64px)] md:h-[calc(100%-64px)]">
        {menuItems.map((item) => {
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
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;