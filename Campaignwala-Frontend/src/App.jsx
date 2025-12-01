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
  // Local state for theme
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });

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