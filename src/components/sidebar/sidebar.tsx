import { useState, useEffect } from "react";
import {
  Home,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { clearAuthStorage, getStoredValue } from "../../app/lib/authStorage";

function SideBar() {
  const [, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getStoredValue("role"));
  }, []);

  const handleLogout = () => {
    clearAuthStorage();
    window.location.href = "/signin";
  };

  const getLinkClasses = (isActive: boolean) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-brand-darker/60 text-white border-l-4 border-brand"
        : "text-white/90 hover:bg-brand-darker/30 hover:text-white"
    }`;
  };

  return (
    <div className="w-64 h-screen flex flex-col bg-gradient-to-b from-brand-navy via-brand-dark to-brand shadow-2xl">
      {/* Header/Logo Section */}
      <div className="px-3 py-3 mt-2 border-b border-white/15">
        <div className="flex items-center justify-center">
          <img
            src="/images/Group_56.png"
            alt="Eye School Logo"
            className="h-16 w-[320px] object-contain"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-6 overflow-y-auto no-scrollbar">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => getLinkClasses(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Home
                    className={`w-5 h-5 ${isActive ? "text-brand" : "text-white/80"}`}
                  />
                  <span className="font-medium">Dashboard</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/15">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-dark hover:bg-brand-darker text-white rounded-lg transition-all duration-200 font-medium border border-white/15"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default SideBar;
