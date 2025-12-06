import { useState, useRef, useEffect } from "react";
import { 
  User, Settings, LogOut, HelpCircle, Shield, Bell, 
  CreditCard, FileText, Users, Activity, ChevronDown 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
  const userName = localStorage.getItem("userName") || "Admin User";
  const userRole = localStorage.getItem("userRole") || "admin";

  const menuItems = [
    {
      label: "My Profile",
      icon: User,
      action: () => navigate("/admin/profile"),
      divider: false
    },
    {
      label: "Account Settings",
      icon: Settings,
      action: () => navigate("/admin/settings"),
      divider: false
    },
    {
      label: "Team Management",
      icon: Users,
      action: () => navigate("/admin/teams"),
      divider: false
    },
    {
      label: "Financial Reports",
      icon: CreditCard,
      action: () => navigate("/admin/financial/reports"),
      divider: false
    },
    {
      label: "Activity Log",
      icon: Activity,
      action: () => navigate("/admin/activity-log"),
      divider: true
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      action: () => navigate("/admin/help"),
      divider: false
    },
    {
      label: "Privacy & Security",
      icon: Shield,
      action: () => navigate("/admin/privacy"),
      divider: false
    },
    {
      label: "Logout",
      icon: LogOut,
      action: () => {
        localStorage.clear();
        window.location.href = "/";
      },
      divider: false,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
    }
  ];

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleProfileClick}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors group"
        aria-label="Profile menu"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {userRole.toUpperCase()}
          </p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-5">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Shield className="w-3 h-3 mr-1" />
                    {userRole.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors ${item.className || ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
                {item.divider && <div className="border-t border-border my-1"></div>}
              </div>
            ))}
          </div>

          {/* Quick Stats Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Sessions</p>
                <p className="text-sm font-semibold text-foreground">24</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-sm font-semibold text-foreground">Today</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}