import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TLHeader from "./TLHeader";
import TLSidebar from "./TLSidebar";

/**
 * TL Dashboard Layout Component
 * Main layout for Team Leader dashboard
 */
export default function TLDashboardLayout() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });

  // Theme management
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <TLSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <TLHeader
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}