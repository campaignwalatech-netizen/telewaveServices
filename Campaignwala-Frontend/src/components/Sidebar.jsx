import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Plus,
  Package,
  LinkIcon,
  Users2,
  MoreVertical,
  Database,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Manage Leads", href: "#" },
  { icon: Users, label: "Manage Account", href: "#" },
  { icon: CheckCircle, label: "Approve Account", href: "#" },
  { icon: Plus, label: "Add Account", href: "#" },
  { icon: Package, label: "All Offers", href: "#", active: true },
  { icon: LinkIcon, label: "Connected Leads", href: "#" },
  { icon: Users2, label: "Team Member", href: "#" },
  { icon: MoreVertical, label: "Miscellaneous", href: "#" },
  { icon: Database, label: "PM Dashboard", href: "#" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 lg:hidden z-50 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static w-64 h-screen bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.jpeg" alt="Logo" className="w-11 h-11 rounded-xl object-contain flex-shrink-0 shadow-xl" />
            <h1 className="text-lg font-bold text-sidebar-foreground text-balance">
              Campaignwala
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-balance ${
                    item.active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
