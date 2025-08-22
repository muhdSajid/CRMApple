import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalBody,
  ModalHeader,
  Label,
  Spinner,
} from "flowbite-react";
import { fetchUsers, addUser, fetchRoles, reset, clearError, updateUserComplete } from "../../store/usersSlice";
import PageWrapper from "../common/PageWrapper";

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [editFormData, setEditFormData] = useState({
    role: '',
    isActive: true
  });
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const dispatch = useDispatch();
  const { users, roles, isLoading, isError, isSuccess, message } = useSelector((state) => state.users);

  // Debug users and roles when they change (reduced logging)
  useEffect(() => {
    if (users.length > 0) {
      console.log('Users loaded:', users.length, 'total');
    }
  }, [users.length]); // Only log when length changes

  useEffect(() => {
    if (roles.length > 0) {
      console.log('Roles loaded:', roles.length, 'total');
    }
  }, [roles.length]); // Only log when length changes

  // Track initial load completion to prevent flickering
  useEffect(() => {
    if (users.length > 0 && roles.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [users.length, roles.length, initialLoadComplete]);

  // Component mounting effect
  useEffect(() => {
    setIsComponentMounted(true);
    return () => setIsComponentMounted(false);
  }, []);

  useEffect(() => {
    // Prevent duplicate calls in development mode and ensure component is mounted
    if (!hasInitialized && isComponentMounted) {
      console.log('Fetching users and roles - first call only');
      dispatch(fetchUsers());
      dispatch(fetchRoles());
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized, isComponentMounted]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(clearError());
    }

    if (isSuccess && message) {
      toast.success(message);
      dispatch(reset());
      
      // Automatically refresh the users list after successful operations
      if (message.includes('added successfully') || message.includes('updated successfully') || message.includes('assigned successfully')) {
        dispatch(fetchUsers());
      }
    }
  }, [isError, isSuccess, message, dispatch]);

  // Effect to sync editFormData when selectedUser changes (for edit modal)
  useEffect(() => {
    if (selectedUser && showEditModal) {
      console.log('=== SYNC FORM DATA EFFECT ===');
      console.log('Syncing form data for user:', selectedUser);
      console.log('User isActive:', selectedUser.isActive);
      
      // Extract the role name from the roles array
      let currentRoleName = '';
      if (Array.isArray(selectedUser.roles) && selectedUser.roles.length > 0) {
        currentRoleName = selectedUser.roles[0];
      }
      
      // Find the matching role from the roles array
      const matchingRole = roles.find(role => role.name === currentRoleName);
      
      const syncedFormData = {
        role: matchingRole ? matchingRole.name : '',
        isActive: selectedUser.isActive === true
      };
      
      console.log('Synced form data:', syncedFormData);
      setEditFormData(syncedFormData);
      console.log('============================');
    }
  }, [selectedUser, showEditModal, roles]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  const handleStatusToggle = (checked) => {
    console.log('=== TOGGLE DEBUG ===');
    console.log('Toggle called with:', checked);
    console.log('Current editFormData:', editFormData);
    console.log('Selected user:', selectedUser);
    
    setEditFormData({
      ...editFormData,
      isActive: checked
    });
    
    console.log('Updated editFormData isActive to:', checked);
    console.log('===================');
  };

  const handleViewUser = (user) => {
    console.log('Opening view modal for user:', user);
    console.log('User roles structure:', user.roles);
    console.log('Available roles from service:', roles);
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    console.log('=== EDIT USER CLICKED ===');
    console.log('Selected user:', user);
    console.log('User isActive:', user.isActive);
    console.log('========================');
    
    // Set the selected user and show modal
    // The useEffect will handle syncing the form data
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!editFormData.role) {
      toast.error('Please select a role');
      return;
    }

    // Find the selected role from the roles array
    const selectedRole = roles.find(role => role.name === editFormData.role);
    
    if (!selectedRole) {
      toast.error('Invalid role selected');
      return;
    }

    const updateUserPayload = {
      userId: selectedUser.id,
      roles: [
        {
          id: selectedRole.id,
          name: selectedRole.name
        }
      ],
      isActive: editFormData.isActive
    };

    console.log('Updating user with payload:', updateUserPayload);
    dispatch(updateUserComplete(updateUserPayload));
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({ role: '', isActive: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error('Please fill in all fields');
      return;
    }

    // Map the form data to match the API format
    const userPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: [formData.role] // Send the role name directly
    };

    dispatch(addUser(userPayload));
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    });
    setShowModal(false);
  };

  const getRoleDisplayName = useCallback((userRoles) => {
    // Don't log on every render to reduce console noise
    // console.log('Role debug - userRoles:', userRoles, 'roles available:', roles.length);
    
    if (!userRoles) {
      return 'N/A';
    }

    // If roles haven't loaded yet, show a stable placeholder to prevent flickering
    if (!roles || roles.length === 0) {
      return '—'; // Using em dash for a cleaner look
    }

    // Handle array of role names (which is the actual API format)
    if (Array.isArray(userRoles)) {
      if (userRoles.length === 0) return 'N/A';
      
      // Get the first role name (string)
      const firstRoleName = userRoles[0];
      
      // Find the matching role in the roles array
      const matchedRole = roles.find(r => r.name === firstRoleName);
      if (matchedRole) {
        return matchedRole.displayName;
      }
      
      // If no match found, return the role name without ROLE_ prefix for readability
      return firstRoleName.replace('ROLE_', '');
    }
    
    // Handle single role string (fallback)
    if (typeof userRoles === 'string') {
      const matchedRole = roles.find(r => r.name === userRoles);
      if (matchedRole) {
        return matchedRole.displayName;
      }
      return userRoles.replace('ROLE_', '');
    }

    return 'N/A';
  }, [roles]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (isActive) => {
    // Handle boolean values from isActive field
    if (isActive === true) {
      return (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Active">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (isActive === false) {
      return (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" title="Inactive">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      // Handle null or undefined values
      return (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" title="Unknown">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  // Filter and sort users with memoization to prevent flickering
  const getFilteredAndSortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    let filteredUsers = [...users]; // Create a copy of the array first

    // Apply search filter
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = getRoleDisplayName(user.roles).toLowerCase();
        const search = searchTerm.toLowerCase();

        return fullName.includes(search) || 
               email.includes(search) || 
               role.includes(search);
      });
    }

    // Apply sorting (now safe because we have a copy)
    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'name':
            aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
            bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'role':
            aValue = getRoleDisplayName(a.roles).toLowerCase();
            bValue = getRoleDisplayName(b.roles).toLowerCase();
            break;
          case 'dateCreated':
            aValue = new Date(a.createdAt || a.dateCreated || 0);
            bValue = new Date(b.createdAt || b.dateCreated || 0);
            break;
          case 'status':
            aValue = a.isActive === true ? 1 : 0;
            bValue = b.isActive === true ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  }, [users, searchTerm, sortConfig, getRoleDisplayName]); // Updated dependency

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 8l4-4 4 4H5zM5 12l4 4 4-4H5z" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 8l4-4 4 4H5z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 12l4 4 4-4H5z" />
      </svg>
    );
  };

  return (
    <PageWrapper isLoading={!initialLoadComplete && isLoading}>
      <div className="page-container p-6 mx-auto">
        <div className="bg-white rounded-xl p-16 shadow ">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Button
              size="sm"
              onClick={() => setShowModal(true)}
              disabled={isLoading}
              className="flex items-center gap-2 text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-4 py-2.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </Button>
          </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {getFilteredAndSortedUsers.length} of {users.length} users
            </p>
          )}
        </div>

        <Table
          striped
          className="table-container [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
        >
          <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
            <TableRow>
              <TableHeadCell 
                className="cursor-pointer hover:bg-sky-800 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  <span>Name</span>
                  {getSortIcon('name')}
                </div>
              </TableHeadCell>
              <TableHeadCell 
                className="cursor-pointer hover:bg-sky-800 select-none"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </TableHeadCell>
              <TableHeadCell 
                className="cursor-pointer hover:bg-sky-800 select-none"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center justify-between">
                  <span>Role</span>
                  {getSortIcon('role')}
                </div>
              </TableHeadCell>
              <TableHeadCell 
                className="cursor-pointer hover:bg-sky-800 select-none"
                onClick={() => handleSort('dateCreated')}
              >
                <div className="flex items-center justify-between">
                  <span>Date Created</span>
                  {getSortIcon('dateCreated')}
                </div>
              </TableHeadCell>
              <TableHeadCell 
                className="cursor-pointer hover:bg-sky-800 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {(isLoading && !initialLoadComplete) ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Spinner size="md" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : getFilteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                  {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              getFilteredAndSortedUsers.map((user) => (
                <TableRow key={user.id || user.email}>
                  <TableCell>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.name || user.username || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleDisplayName(user.roles)}</TableCell>
                  <TableCell>{formatDate(user.createdAt || user.dateCreated)}</TableCell>
                  <TableCell>
                    {getStatusIcon(user.isActive)}
                  </TableCell>
                  <TableCell className="flex gap-3">
                    <button
                      onClick={() => handleViewUser(user)}
                      disabled={isLoading}
                      className="group relative flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View User Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      disabled={isLoading}
                      className="group relative flex items-center justify-center w-8 h-8 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit User"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {showModal && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <ModalHeader>ADD NEW USER</ModalHeader>
          <ModalBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="border bg-white border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5 disabled:bg-gray-100"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add User'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      role: ''
                    });
                  }}
                  disabled={isLoading}
                  className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  Close
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
          <ModalHeader>USER DETAILS</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <input
                    type="text"
                    value={selectedUser.firstName || 'N/A'}
                    readOnly
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <input
                    type="text"
                    value={selectedUser.lastName || 'N/A'}
                    readOnly
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <input
                  type="text"
                  value={selectedUser.email || 'N/A'}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <Label>Role</Label>
                <input
                  type="text"
                  value={getRoleDisplayName(selectedUser.roles)}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <Label>Date Created</Label>
                <input
                  type="text"
                  value={formatDate(selectedUser.createdAt || selectedUser.dateCreated)}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <Label>Status</Label>
                <input
                  type="text"
                  value={selectedUser.isActive === true ? 'Active' : selectedUser.isActive === false ? 'Inactive' : 'Unknown'}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Close
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
          <ModalHeader>EDIT USER</ModalHeader>
          <ModalBody>
            <form className="space-y-5" onSubmit={handleEditSubmit}>
              <div>
                <Label>User</Label>
                <input
                  type="text"
                  value={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email})`}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  required
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                  disabled={isLoading}
                  className="border bg-white border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5 disabled:bg-gray-100"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>User Status</Label>
                <div className="mt-2">
                  {/* Custom Toggle Switch Implementation */}
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(!editFormData.isActive)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                        editFormData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editFormData.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${editFormData.isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {editFormData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.isActive 
                      ? "User can access the system" 
                      : "User access is disabled"
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setEditFormData({ role: '', isActive: true });
                  }}
                  disabled={isLoading}
                  className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
      </div>
    </PageWrapper>
  );
};

export default UserManagement;
