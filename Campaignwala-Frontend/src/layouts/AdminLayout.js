import React from "react";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <div className="font-sans antialiased">
      {children}
    </div>
  );
}
