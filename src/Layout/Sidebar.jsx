import { Link } from "react-router-dom";
import { FaRupeeSign, FaMedkit, FaCartPlus, FaBookReader } from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { IoMdHeadset } from "react-icons/io";
import SVYMLogo from "../Assets/SVYM-logo.jpg";

const Sidebar = () => {
  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-55 h-screen pt-4 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-6 overflow-y-auto bg-white dark:bg-gray-800">
        <div className="flex justify-center">
          <a href="/">
            <img
              src={SVYMLogo}
              alt="SVYM Logo"
              className="h-16 w-auto object-contain"
            />
          </a>
        </div>
        <ul className="space-y-1 font-medium pt-5 font-serif">
          <li>
            <Link
              to="/stock"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <HiClipboardDocumentList className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="ms-3">Medicine Stock</span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaCartPlus className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap">Purchase</span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaMedkit className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap">
                Distribution
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaRupeeSign className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap">Costing</span>
            </Link>
          </li>
          <hr className="w-48 h-px mx-auto my-4 bg-gray-300 border-0 rounded-sm md:my-10 dark:bg-gray-700"></hr>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaBookReader className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap text-gray-400 ">
                User Guide
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FaClipboardQuestion  className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap text-gray-400">
                FAQ
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <IoMdHeadset className="text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900" />
              <span className="flex-1 ms-3 whitespace-nowrap text-gray-400">
                Help Center
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
