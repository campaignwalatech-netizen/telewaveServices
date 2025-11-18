import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userPhone");
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg border border-primary/20"
        aria-label="Profile menu"
      >
        <User className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-border/30 bg-muted/10">
            <p className="text-sm font-bold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground mt-1">admin@freelancer.com</p>
          </div>
          <div className="py-2">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/30 transition-all duration-200 font-medium"
              onClick={() => {
                setIsOpen(false);
                navigate("/admin/settings");
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-all duration-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
