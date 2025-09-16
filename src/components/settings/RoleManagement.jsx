import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserShield, FaSave, FaTimes, FaCheck, FaEdit, FaEye } from 'react-icons/fa';
import {
  getAllRolesWithPrivileges,
  getAllPrivileges,
  assignPrivilegesToRole
} from '../../service/apiService';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPrivileges, setAllPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching roles and privileges...');
      
      const [rolesResponse, privilegesResponse] = await Promise.all([
        getAllRolesWithPrivileges(),
        getAllPrivileges()
      ]);
      
      console.log('Raw roles response:', rolesResponse);
      console.log('Raw privileges response:', privilegesResponse);
      
      // Handle different response structures - ensure we always get arrays
      let rolesData = [];
      let privilegesData = [];
      
      if (Array.isArray(rolesResponse)) {
        rolesData = rolesResponse;
      } else if (rolesResponse && Array.isArray(rolesResponse.data)) {
        rolesData = rolesResponse.data;
      } else if (rolesResponse && rolesResponse.data) {
        console.warn('Unexpected roles response structure:', rolesResponse);
        rolesData = [];
      }
      
      if (Array.isArray(privilegesResponse)) {
        privilegesData = privilegesResponse;
      } else if (privilegesResponse && Array.isArray(privilegesResponse.data)) {
        privilegesData = privilegesResponse.data;
      } else if (privilegesResponse && privilegesResponse.data) {
        console.warn('Unexpected privileges response structure:', privilegesResponse);
        privilegesData = [];
      }
      
      console.log('Processed roles data:', rolesData);
      console.log('Processed privileges data:', privilegesData);
      
      setRoles(rolesData);
      setAllPrivileges(privilegesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load roles and privileges data: ' + error.message);
      
      // Set empty arrays if API calls fail
      setRoles([]);
      setAllPrivileges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setSelectedPrivileges(role.privileges ? role.privileges.map(p => p.id) : []);
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setSelectedPrivileges([]);
  };

  const handlePrivilegeToggle = (privilegeId) => {
    setSelectedPrivileges(prev => {
      if (prev.includes(privilegeId)) {
        return prev.filter(id => id !== privilegeId);
      } else {
        return [...prev, privilegeId];
      }
    });
  };

  // Group privileges by the text before the first dot
  const groupPrivilegesByPrefix = (privileges) => {
    const groups = {};
    
    privileges.forEach(privilege => {
      const privilegeName = privilege.privilegeName || privilege.name || '';
      const dotIndex = privilegeName.indexOf('.');
      
      // Get the prefix (text before first dot), or use the full name if no dot
      const prefix = dotIndex !== -1 ? privilegeName.substring(0, dotIndex) : privilegeName;
      const groupKey = prefix || 'Other';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(privilege);
    });
    
    // Sort groups alphabetically and return as array of [groupName, privileges]
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const handleSavePrivileges = async () => {
    if (!editingRole) return;

    try {
      setSaving(true);
      await assignPrivilegesToRole(editingRole.id, selectedPrivileges);
      
      toast.success(`Privileges updated successfully for ${editingRole.displayName}`);
      
      // Refresh the data to show updated privileges
      await fetchData();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating privileges:', error);
      toast.error('Failed to update privileges');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FaUserShield className="text-blue-600 text-2xl mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Role & Privilege Management</h1>
      </div>
      
      <p className="text-gray-600 mb-6">
        Manage user roles and assign privileges to control access to different parts of the system.
      </p>

      {/* Roles List */}
      <div className="space-y-4">
        {Array.isArray(roles) && roles.length > 0 ? (
          roles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Role Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{role.displayName}</h4>
                    <p className="text-sm text-gray-500 mb-2">{role.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">Privileges:</span>
                      <span className="font-medium">
                        {role.privileges && Array.isArray(role.privileges) ? role.privileges.length : 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {editingRole?.id === role.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSavePrivileges}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaSave className="mr-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit className="mr-2" />
                        Edit Privileges
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Privileges Section - Only show when editing */}
              {editingRole?.id === role.id && (
                <div className="p-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-4">
                      Select Privileges for {role.displayName}:
                    </h5>
                    <div className="max-h-96 overflow-y-auto">
                      {Array.isArray(allPrivileges) && groupPrivilegesByPrefix(allPrivileges).map(([groupName, groupPrivileges]) => (
                        <div key={groupName} className="mb-6">
                          <h6 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center">
                            <span className="h-px bg-gray-300 flex-1 mr-3"></span>
                            {groupName}
                            <span className="h-px bg-gray-300 flex-1 ml-3"></span>
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {groupPrivileges.map((privilege) => (
                              <label
                                key={privilege.id}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedPrivileges.includes(privilege.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPrivileges.includes(privilege.id)}
                                  onChange={() => handlePrivilegeToggle(privilege.id)}
                                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {privilege.privilegeName || privilege.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {privilege.description}
                                  </div>
                                </div>
                                {selectedPrivileges.includes(privilege.id) && (
                                  <FaCheck className="text-blue-600 mt-1" />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="text-center py-12">
              <FaUserShield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-500 mb-4">
                {!Array.isArray(roles) 
                  ? 'Unable to load roles data. Please check your connection and try again.'
                  : 'No roles are available in the system.'
                }
              </p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;