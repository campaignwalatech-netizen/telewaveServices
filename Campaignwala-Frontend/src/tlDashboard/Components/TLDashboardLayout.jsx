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
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme === 'true' || savedTheme === null; // Default to dark if not set
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Theme management - sync with AppRouter
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'true');
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`flex ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <TLSidebar
        darkMode={isDark}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col">
        {/* Navbar is fixed, full width */}
        <TLHeader
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
          onSidebarToggle={toggleSidebar}
          sidebarOpen={isSidebarOpen}
        />

        {/* Main content shifted only on desktop */}
        <main
          className={`p-3 sm:p-4 md:p-6 min-h-screen pt-16 sm:pt-20 transition-all duration-300 w-full ${
            isSidebarOpen ? "md:ml-64" : "md:ml-16"
          }`}
        >
          <Outlet context={{ darkMode: isDark, setDarkMode: setIsDark }} />
        </main>
      </div>
    </div>
  );
}