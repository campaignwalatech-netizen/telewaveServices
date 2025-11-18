import { Moon, Sun, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";
import userService from "../../services/userService";

export default function Header({ isDark, onThemeToggle }) {
  const location = useLocation();
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  
  // Fetch active users count
  useEffect(() => {
    const fetchActiveUsersCount = async () => {
      try {
        const response = await userService.getAllUsersWithStats({ 
          page: 1, 
          limit: 1000 
        });
        
        if (response.success) {
          const activeUsers = response.data.users.filter(user => user.isActive === true);
          setActiveUsersCount(activeUsers.length);
        }
      } catch (error) {
        console.error('Error fetching active users count:', error);
        setActiveUsersCount(0);
      }
    };

    fetchActiveUsersCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchActiveUsersCount, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getPageTitle = () => {
    const path = location.pathname.replace('/admin/', '').replace('/admin', '');
    if (!path || path === '/') {
      return "ALL Offers";
    }
    return path.toUpperCase().replace(/-/g, " ");
  };

  const handleExport = () => {
    alert("Exporting data...");
  };

  return (
    <header className="border-b border-border/50 bg-card/40 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div className="min-w-0 flex-1 lg:ml-0 ml-12">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeUsersCount} active {activeUsersCount === 1 ? 'user' : 'users'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
         
          <button
            onClick={onThemeToggle}
            className="p-2.5 hover:bg-muted/60 rounded-lg transition-all duration-200 flex-shrink-0 border border-border/30 hover:border-border shadow-sm"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
