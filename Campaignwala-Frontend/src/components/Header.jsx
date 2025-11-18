import React from "react";
import { Moon, Sun } from "lucide-react";
import ProfileMenu from "./ProfileMenu"; // ✅ Adjust import to match your file name

const Header = ({ isDark, onThemeToggle }) => {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="min-w-0 flex-1 lg:ml-0 ml-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-balance">
            ALL CAMPAIGNS
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-balance">
            18 active campaigns
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={onThemeToggle}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
