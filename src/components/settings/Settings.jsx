import React from 'react';
import { Link } from 'react-router-dom';
import { FaMedkit, FaMapMarkerAlt, FaUserShield, FaUsers } from 'react-icons/fa';

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/usermanagment"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <div className="flex items-center mb-2">
            <FaUsers className="text-indigo-600 text-xl mr-3" />
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              User Management
            </h5>
          </div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Manage system users, create accounts, and control user access.
          </p>
        </Link>

        <Link
          to="/settings/medicine-types"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <div className="flex items-center mb-2">
            <FaMedkit className="text-blue-600 text-xl mr-3" />
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Medicine Types
            </h5>
          </div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Manage different types of medicines in the system.
          </p>
        </Link>

        <Link
          to="/settings/locations"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <div className="flex items-center mb-2">
            <FaMapMarkerAlt className="text-green-600 text-xl mr-3" />
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Locations
            </h5>
          </div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Manage warehouse and storage locations.
          </p>
        </Link>

        <Link
          to="/settings/role-management"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <div className="flex items-center mb-2">
            <FaUserShield className="text-purple-600 text-xl mr-3" />
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Role Management
            </h5>
          </div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Manage user roles and assign privileges to control system access.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Settings;
