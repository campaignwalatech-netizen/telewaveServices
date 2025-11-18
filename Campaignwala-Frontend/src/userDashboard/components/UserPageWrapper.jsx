import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';

const UserPageWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    // Small delay to ensure localStorage is properly set
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userType = localStorage.getItem("userType");
      const userPhone = localStorage.getItem("userPhone");
      
      console.log("=== UserPageWrapper AUTH CHECK ===");
      console.log("Current path:", window.location.pathname);
      console.log("isLoggedIn:", isLoggedIn);
      console.log("userType:", userType);
      console.log("userPhone:", userPhone);
      console.log("typeof isLoggedIn:", typeof isLoggedIn);
      console.log("isLoggedIn === 'true':", isLoggedIn === "true");
      console.log("userType === 'user':", userType === "user");
      
      if (!isLoggedIn || isLoggedIn !== "true" || userType !== "user") {
        console.log("❌ UserPageWrapper - Auth failed, redirecting to login");
        navigate("/");
      } else {
        console.log("✅ UserPageWrapper - Auth success, staying on page");
      }
    };
    
    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 50);
  }, [navigate]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Sidebar */}
        <Sidebar darkMode={darkMode} />
        
        {/* Main Content */}
        <div className="ml-64 min-h-screen">
          {/* Navbar */}
          <Navbar />
          
          {/* Page Content */}
          <main className="pb-20">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserPageWrapper;