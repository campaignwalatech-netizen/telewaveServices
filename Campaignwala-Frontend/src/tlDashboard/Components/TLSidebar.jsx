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
export default function TLSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/tl/dashboard" },
  { id: "team", label: "HR List", icon: Users, path: "/tl/team" },
  // { id: "data", label: "Data Management", icon: Briefcase, path: "/tl/data" },
  { id: "distribute-data", label: "Distribute Data", icon: Share2, path: "/tl/data/distribute" },
  { id: "performance", label: "Check HR Performance", icon: TrendingUp, path: "/tl/performance" },
  { id: "reports", label: "Today's present HR", icon: BarChart3, path: "/tl/reports" },
  { id: "assignments", label: "Pending Accounts", icon: Share2, path: "/tl/assignments" },
  { id: "approvals", label: "Approved Account", icon: UserCheck, path: "/tl/approvals" },
  { id: "withdrawn-data", label: "Withdrawn Data", icon: XCircle, path: "/tl/data/withdrawn" },
  { id: "settings", label: "Settings", icon: Settings, path: "/tl/settings" }, 
];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
      >
        {isCollapsed ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isCollapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          flex flex-col overflow-y-auto
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Team Leader</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                setActiveMenu(item.id);
                setIsCollapsed(false);
              }}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive || activeMenu === item.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="font-bold text-white">TL</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-white">Team Leader</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage Team & Leads</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}