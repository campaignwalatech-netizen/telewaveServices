import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { 
  selectIsAuthenticated, 
  selectUserRole, 
  updateLastActivity,
  logoutUser
} from "./redux/slices/authSlice";

// Components
import Sidebar from "./adminDashboard/components/Sidebar";
import Header from "./adminDashboard/components/Header";

/**
 * Admin Dashboard Layout Component
 * Main layout component for admin users
 */
export default function App() {
  const dispatch = useDispatch();
  
  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  
  // Local state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });

  // Session management
  useEffect(() => {
    // Update last activity on component mount and user interactions
    const handleUserActivity = () => {
      dispatch(updateLastActivity());
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [dispatch]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <Header
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
        />
        <main className="flex-1 overflow-auto scrollbar-hide bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}