import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

// Components
import Sidebar from "./adminDashboard/components/Sidebar";
import Header from "./adminDashboard/components/Header";

/**
 * Admin Dashboard Layout Component
 * Main layout component for admin users
 */
export default function App() {
  // Local state for theme - sync with AppRouter's darkMode
  const [isDark, setIsDark] = useState(() => {
    // Check both 'darkMode' (from AppRouter) and 'theme' (legacy) for compatibility
    const darkMode = localStorage.getItem('darkMode');
    const theme = localStorage.getItem('theme');
    if (darkMode !== null) {
      return darkMode === 'true';
    }
    return theme !== 'light';
  });

  // Theme management - sync with AppRouter's darkMode
  useEffect(() => {
    // Listen for storage changes to sync with AppRouter
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        const newDarkMode = e.newValue === 'true';
        setIsDark(newDarkMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      const darkMode = localStorage.getItem('darkMode');
      if (darkMode !== null) {
        const shouldBeDark = darkMode === 'true';
        if (shouldBeDark !== isDark) {
          setIsDark(shouldBeDark);
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isDark]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('darkMode', 'true');
      localStorage.setItem('theme', 'dark'); // Keep legacy key for compatibility
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('darkMode', 'false');
      localStorage.setItem('theme', 'light'); // Keep legacy key for compatibility
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