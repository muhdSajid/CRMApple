import { useState } from "react";
import profilePic from "../Assets/download.jpeg";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-[220px] w-[calc(100%-220px)] z-50 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-2 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="text-md font-semibold text-gray-900 dark:text-white">
            Home
          </div>

          {/* Profile Section */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 bg-white hover:bg-gray-100 px-3 py-2 rounded-md focus:outline-none"
            >
              <img
                src={profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  Kristin Watson
                </div>
                <div className="text-xs text-gray-500">@estherhoward</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <ul className="py-1 text-sm text-gray-700">
                  <li>
                    <a href="/" className="block px-4 py-2 hover:bg-gray-100">
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/" className="block px-4 py-2 hover:bg-gray-100">
                      Settings
                    </a>
                  </li>
                  <li>
                    <a href="/" className="block px-4 py-2 hover:bg-gray-100">
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
