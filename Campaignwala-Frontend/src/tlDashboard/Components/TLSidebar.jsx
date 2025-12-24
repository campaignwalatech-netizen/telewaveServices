import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home,
  Users,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Award,
  DollarSign,
  MessageSquare,
  Bell,
  UserCheck,
  Share2,
  Filter,
  XCircle
} from "lucide-react";

/**
 * TL Sidebar Component
 * Navigation sidebar for Team Leader dashboard
 */
export default function TLSidebar({ darkMode, isSidebarOpen, toggleSidebar }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/tl/dashboard" },
  { id: "teamList", label: "HR List", icon: Users, path: "/tl/teamList" },
  // { id: "LeadsManage", label: "Leads Manage", icon: Users, path: "/tl/leads/manage" },
  // { id: "data", label: "Data Management", icon: Briefcase, path: "/tl/data" },
  { id: "distribute-data", label: "Distribute Data", icon: Share2, path: "/tl/data/distribute" },
  { id: "performance", label: "Check HR Performance", icon: TrendingUp, path: "/tl/performance" },
  { id: "reports", label: "Today's present HR", icon: BarChart3, path: "/tl/reports" },
  { id: "assignments", label: "Pending Accounts", icon: Share2, path: "/tl/assignments" },
  { id: "approvals", label: "Approved Account", icon: UserCheck, path: "/tl/approvals" },
  { id: "withdrawn-data", label: "Withdrawn Data", icon: XCircle, path: "/tl/data/withdrawn" },
  { id: "settings", label: "Settings", icon: Settings, path: "/tl/settings" }, 
];

  const handleItemClick = (path) => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={`fixed top-16 z-40 h-[calc(100%-64px)] transition-all duration-300 ease-in-out 
      ${isSidebarOpen ? "left-0 w-64" : "-left-full md:left-0 md:w-16"} 
      ${darkMode ? "bg-gray-900 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-gray-700" : "bg-gradient-to-b from-blue-50 via-white to-purple-50 border-gray-200"} 
      border-r shadow-lg`}
    >
      

      {/* Menu */}
      <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100%-64px)] md:h-[calc(100%-64px)]">
        {isSidebarOpen ? (
          // Render with labels when sidebar is open
          menuItems.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => {
                  setActiveMenu(item.id);
                  handleItemClick(item.path);
                }}
                className={({ isActive: navIsActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 
                  ${
                    navIsActive || isActive || activeMenu === item.id
                      ? darkMode
                        ? "border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                        : "border-blue-600 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-300/50"
                      : darkMode
                      ? "text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                  }
                `}
              >
                <item.icon className="shrink-0" size={18} />
                <span className="text-sm font-medium text-left">{item.label}</span>
              </NavLink>
            );
          })
        ) : (
          // Render without labels when sidebar is collapsed
          menuItems.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => {
                  setActiveMenu(item.id);
                  handleItemClick(item.path);
                }}
                className={({ isActive: navIsActive }) => `
                  w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 
                  ${
                    navIsActive || isActive || activeMenu === item.id
                      ? darkMode
                        ? "border-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                        : "border-blue-600 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-300/50"
                      : darkMode
                      ? "text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                  }
                `}
                title={!isSidebarOpen ? item.label : ""}
              >
                <item.icon className="shrink-0" size={20} />
              </NavLink>
            );
          })
        )}
      </nav>

      {/* User Profile Section */}
      {isSidebarOpen && (
        <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`flex items-center space-x-3 p-3 rounded-lg ${
            darkMode ? "bg-gray-800/50" : "bg-gray-50"
          }`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="font-bold text-white">TL</span>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Team Leader</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Manage Team & Leads</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}