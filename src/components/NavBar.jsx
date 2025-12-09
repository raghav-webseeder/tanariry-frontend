import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { User, Bell } from "lucide-react";
import useAdminStore from "../store/useAdminStore";
import OrderNotifications from "./OrderNotifications";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Notifications", path: "/notifications" },
  { label: "Orders", path: "/sales/orders" },
  { label: "Abandoned Cart", path: "/sales/abandoned-cart" },
  { label: "Cancelled Orders", path: "/sales/cancelled-orders" },
  { label: "Wishlist", path: "/sales/wishlist" },
  { label: "Products", path: "/catalogue/product" },
  { label: "Categories", path: "/catalogue/categories" },
  { label: "Customers", path: "/customers" },
  { label: "Distributor", path: "/distributor" },
  { label: "Inquiry", path: "/inquiry" },
  { label: "Settings", path: "/settings" },
  { label: "Support", path: "/support" },
  { label: "Help", path: "/help" },
  { label: "Manage Profile", path: "/manage-profile" },
  { label: "Change Password", path: "/change-password" },
  { label: "Reports", path: "/report" },
  { label: "Finances", path: "/finance" },
];

export default function Navbar({ toggleSidebar }) {
  const { adminLogout } = useAdminStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin"); // Default state

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load Admin Name from LocalStorage on Mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.firstName) {
          // Combine First and Last name, or just use First name
          const fullName = parsedUser.lastName
            ? `${parsedUser.firstName} ${parsedUser.lastName}`
            : parsedUser.firstName;
          setAdminName(fullName);
        }
      }
    } catch (error) {
      console.error("Error parsing adminUser from localStorage:", error);
    }
  }, []);

  const getActiveLabel = () => {
    const activeItem = menuItems.find((item) => {
      return location.pathname.startsWith(item.path);
    });

    return activeItem ? activeItem.label : "Dashboard";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlelogout = async () => {
    try {
      await adminLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="px-3 sm:px-4 py-2.5 flex justify-between items-center">
        {/* Left Section: Hamburger + Logo + Page Title */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden transition-colors"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-gray-600" size={20} />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/TanaRiri_Logo.png"
              alt="Logo"
              className="h-7 w-auto sm:h-8"
            />

            {/* Divider (visible on mobile to separate logo/title) */}
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
              {getActiveLabel()}
            </h1>
          </div>
        </div>

        {/* Right Section: Bell + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <OrderNotifications />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              onClick={toggleDropdown}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
                <span className="text-sm font-bold text-blue-700">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Admin
                </span>
              </div>
            </button>

            {/* Dropdown Menu (Hidden by default, shown via state) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handlelogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
