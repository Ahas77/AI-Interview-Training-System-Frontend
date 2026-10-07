import { ReactNode, useState, useEffect, useRef } from "react";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import SideBar from "../sidebar/sidebar";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../app/lib/axiosInstance";
import { toast } from "react-toastify";
import { defaultConfig } from "../../app/configs/common";
import { usePageMetadata } from "../../context/PageContext";
import { clearAuthStorage, getStoredValue } from "../../app/lib/authStorage";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { metadata: pageMetadata } = usePageMetadata();

  const storedAvatar = getStoredValue("avatar");
  const storedName = getStoredValue("name") || "User";
  const [userEmail, setUserEmail] = useState<string>("user@example.com");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const email = getStoredValue("email");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleLogOut = async () => {
    try {
      const response = await axiosInstance.post<LogoutResponse>("/logout");
      if (response.data.success) {
        clearAuthStorage();
        toast.success(response.data.message);
        navigate("/signin");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      clearAuthStorage();
      navigate("/signin");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        id="sidebar-multi-level-sidebar"
        className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <SideBar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-brand-navy via-brand-dark to-brand shadow-md">
          <div className="px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left Section - Mobile Menu + Title */}
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={toggleSidebar}
                  className="inline-flex items-center p-2 text-white rounded-lg sm:hidden hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-controls="sidebar-multi-level-sidebar"
                  aria-expanded={isSidebarOpen ? "true" : "false"}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Menu size={24} />
                </button>

                {/* Page Title from Context */}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-white">
                    {pageMetadata.title}
                  </h1>
                  {pageMetadata.subtitle && (
                    <p className="text-sm text-gray-300 mt-1">
                      {typeof pageMetadata.subtitle === "string"
                        ? pageMetadata.subtitle
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Verify Certificate Button */}
                {/* <Link
                  to="/verify-certificate"
                  className="hidden sm:flex items-center gap-2 bg-transparent hover:bg-white/10 text-white/90 hover:text-white px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Award size={18} className="text-brand" />
                  <span className="text-sm font-medium hidden md:inline">
                    Verify Certificate
                  </span>
                </Link> */}

                {/* Notification Icon */}
                {/* <div className="relative">
                  <button className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-semibold">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                </div> */}

                {/* Profile Section */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 sm:gap-3 hover:bg-white/10 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <img
                      src={
                        storedAvatar && storedAvatar !== "null"
                          ? `${defaultConfig.BASE_ASSEST_URL}/${storedAvatar}`
                          : "/images/profile_picture.png"
                      }
                      alt="Profile"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-brand/70"
                    />
                    <span className="text-white font-medium text-sm sm:text-base hidden lg:inline">
                      {storedName}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 text-white ${
                        isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              storedAvatar && storedAvatar !== "null"
                                ? `${defaultConfig.BASE_ASSEST_URL}/${storedAvatar}`
                                : "/images/profile_picture.png"
                            }
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {storedName}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <nav className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        {/* <Link
                          to="/certificates"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Award className="w-4 h-4" />
                          <span>My Certificates</span>
                        </Link> */}
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
