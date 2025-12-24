import {
  LayoutDashboard, Users, Package, Users2, MoreVertical, Database, Menu, X, Grid, ChevronDown, ChevronRight, Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    id: "manage-account",
    icon: Users,
    label: "Manage Account",
    key: "manage-account",
    submenu: [
      { key: "all-Offers", label: "All Offers", icon: Package },
      { key: "add-Offers", label: "Add Offers", icon: Grid },
      { key: "approve-Offers", label: "Approve Offers", icon: Database },
    ]
  },
  {
    id: "manage-category",
    icon: Grid,
    label: "Manage Category",
    key: "manage-category",
    submenu: [
      { key: "all-categories", label: "All Categories", icon: Grid },
      { key: "add-category", label: "Add Category", icon: Grid },
    ]
  },
  {
    id: "leads",
    icon: Database,
    label: "Leads",
    key: "leads",
    submenu: [
      { key: "abc-analytics", label: "ABC Analytics", icon: Database },
      { key: "leads-pending", label: "All Pending", icon: Database },
      { key: "leads-approved", label: "Approved", icon: Database },
      { key: "leads-completed", label: "Completed", icon: Database },
      { key: "leads-rejected", label: "Rejected", icon: Database },
    ]
  },
  {
    id: "user-management",
    icon: Users2,
    label: "User Management",
    key: "user-management",
    submenu: [
      { key: "all-users", label: "All Users", icon: Users2 },
      { key: "all-active-users", label: "All Active Users", icon: Users2 },
      { key: "all-hold-users", label: "All Hold Users", icon: Users2 },
      { key: "all-ex-users", label: "All Ex Users", icon: Users2 },
    ]
  },
  {
    id: "slideboard",
    icon: LayoutDashboard,
    label: "Slide Board",
    key: "slideboard",
    submenu: [
      { key: "all-slides", label: "All Slides", icon: LayoutDashboard },
      { key: "add-slide", label: "Add Slide", icon: LayoutDashboard },
    ]
  },
  {
    id: "payment-withdrawal",
    icon: Package,
    label: "Payment Withdrawal List",
    key: "payment-withdrawal"
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    key: "notifications",
    submenu: [
      { key: "notifications", label: "Dashboard", icon: Bell },
      { key: "notifications/incomplete-profile", label: "Incomplete Profile", icon: Bell },
      { key: "notifications/hot-offers", label: "Hot Offers", icon: Bell },
      { key: "notifications/history", label: "History", icon: Bell },
    ]
  },
  {
    id: "miscellaneous",
    icon: MoreVertical,
    label: "Miscellaneous",
    key: "miscellaneous",
    submenu: [
      { key: "reset-password", label: "Reset User Password", icon: MoreVertical },
      { key: "admin-logs", label: "Admin Activity Logs", icon: MoreVertical },
      { key: "user-queries", label: "User Queries", icon: MoreVertical },
      { key: "kyc-review", label: "KYC Review", icon: MoreVertical },
    ]
  }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Auto-expand parent menus based on current route
  const getExpandedMenus = () => {
    const expanded = {};
    menuItems.forEach(item => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem => {
          const subItemPath = `/admin/${subItem.key}`;
          return location.pathname === subItemPath || 
                 (subItem.key === "all-users" && location.pathname === "/admin/all-users");
        });
        if (hasActiveSubmenu) {
          expanded[item.id] = true;
        }
      }
    });
    return expanded;
  };

  const [expandedMenus, setExpandedMenus] = useState(getExpandedMenus());

  // Update expanded menus when location changes
  useEffect(() => {
    setExpandedMenus(prev => ({ ...prev, ...getExpandedMenus() }));
  }, [location.pathname]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActive = (path) => {
    return location.pathname === `/admin/${path}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 lg:hidden z-50 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <aside
        className={`fixed lg:static w-64 h-screen bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border/50 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-sidebar-border/30">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-card border-2 border-gray-400 overflow-hidden flex-shrink-0 shadow-xl">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </span>
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">
            <span className="font-bold text-lg">
                Freelancer Wala
              </span></h1>
          </div>
          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.id];

              return (
                <div key={item.id}>
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group ${
                        expandedMenus[item.id] 
                          ? "text-sidebar-foreground bg-sidebar-accent/30" 
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <NavLink
                      to={`/admin/${item.key}`}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => {
                        return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-lg border border-sidebar-border/20"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 hover:translate-x-1"
                        }`;
                      }}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  )}
                  
                  {hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-sidebar-border/30 pl-4">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubItemActive = location.pathname === `/admin/${subItem.key}` || 
                                               (subItem.key === "all-users" && location.pathname === "/admin/all-users");
                        return (
                          <Link
                            key={subItem.key}
                            to={`/admin/${subItem.key}`}
                            onClick={() => setIsOpen(false)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isSubItemActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-md"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                            }`}
                          >
                            <SubIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  );
}