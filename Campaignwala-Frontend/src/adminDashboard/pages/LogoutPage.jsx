import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Here you would clear auth tokens, etc.
    // For now, just redirect to login after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  }, [navigate]);

  return (
  <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg border border-border text-center">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Logging out...</h1>
      <p className="text-muted-foreground">You are being logged out. Redirecting to login page.</p>
    </div>
  );
}
