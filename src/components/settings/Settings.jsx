import React from 'react';
import { Link } from 'react-router-dom';
import { FaMedkit, FaMapMarkerAlt, FaUserShield, FaUsers } from 'react-icons/fa';
import PrivilegeGuard from '../common/PrivilegeGuard';
import { usePrivileges } from '../../hooks/usePrivileges';
import { PRIVILEGES } from '../../utils/privilegeUtils';

const Settings = () => {
  const { roleDisplayName, isRoleLoaded } = usePrivileges();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {isRoleLoaded && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Role: {roleDisplayName}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PrivilegeGuard 
          privileges={[PRIVILEGES.USER_READ, PRIVILEGES.USER_ALL]} 
          fallback={
            <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center mb-2">
                <FaUsers className="text-gray-400 text-xl mr-3" />
                <h5 className="text-xl font-bold tracking-tight text-gray-400">
                  User Management
                </h5>
              </div>
              <p className="font-normal text-gray-400">
                Access restricted - requires user management privileges.
              </p>
            </div>
          }
        >
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
        </PrivilegeGuard>

        <PrivilegeGuard 
          privileges={[PRIVILEGES.SETTINGS_MEDICINE_ALL, PRIVILEGES.SETTINGS_ALL]}
          fallback={
            <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center mb-2">
                <FaMedkit className="text-gray-400 text-xl mr-3" />
                <h5 className="text-xl font-bold tracking-tight text-gray-400">
                  Medicine Types
                </h5>
              </div>
              <p className="font-normal text-gray-400">
                Access restricted - requires medicine settings privileges.
              </p>
            </div>
          }
        >
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
        </PrivilegeGuard>

        <PrivilegeGuard 
          privileges={[PRIVILEGES.SETTINGS_LOCATION_ALL, PRIVILEGES.SETTINGS_ALL]}
          fallback={
            <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="text-gray-400 text-xl mr-3" />
                <h5 className="text-xl font-bold tracking-tight text-gray-400">
                  Locations
                </h5>
              </div>
              <p className="font-normal text-gray-400">
                Access restricted - requires location settings privileges.
              </p>
            </div>
          }
        >
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
        </PrivilegeGuard>

        <PrivilegeGuard 
          roles="ROLE_ADMIN"
          fallback={
            <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center mb-2">
                <FaUserShield className="text-gray-400 text-xl mr-3" />
                <h5 className="text-xl font-bold tracking-tight text-gray-400">
                  Role Management
                </h5>
              </div>
              <p className="font-normal text-gray-400">
                Access restricted - admin role required.
              </p>
            </div>
          }
        >
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
        </PrivilegeGuard>
      </div>
    </div>
  );
};

export default Settings;
