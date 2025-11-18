
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@freelancer.com",
    avatar: "/logo.jpeg"
  });
  const navigate = useNavigate();

  const handleDarkModeChange = (e) => {
    setDarkMode(e.target.checked);
    localStorage.setItem("darkMode", e.target.checked);
    document.body.classList.toggle("dark", e.target.checked);
  };

  const handleChangePassword = () => {
    navigate("/admin/reset-password");
  };

  return (
  <div className="w-full p-8 bg-card shadow-2xl border border-border" style={{marginBottom:0,borderRadius:0}}>
      <div className="flex items-center gap-5 mb-8">
        <img src={profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <h1 className="text-xl font-bold mb-4 text-foreground">Account Settings</h1>
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-base text-foreground font-medium">Email Notifications</span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={e => setEmailNotifications(e.target.checked)}
              className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-muted-foreground">Enable</span>
          </label>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-base text-foreground font-medium">Dark Mode</span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkModeChange}
              className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-muted-foreground">Enable</span>
          </label>
        </div>

        <div className="flex items-center justify-between py-4">
          <span className="text-base text-foreground font-medium">Change Password</span>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            onClick={handleChangePassword}
          >
            Change
          </button>
        </div>
      </div>
    </div>
  );
}
