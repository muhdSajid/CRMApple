import { useState, useEffect } from "react";
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
import { fetchUsers, addUser, assignRole, fetchRoles, reset, clearError } from "../../store/usersSlice";

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [editFormData, setEditFormData] = useState({
    role: ''
  });

  const dispatch = useDispatch();
  const { users, roles, isLoading, isError, isSuccess, message } = useSelector((state) => state.users);

  // Debug users and roles when they change
  useEffect(() => {
    if (users.length > 0) {
      console.log('=== USERS LOADED DEBUG ===');
      console.log('Total users:', users.length);
      console.log('Sample user:', users[0]);
      console.log('Sample user roles:', users[0].roles);
      console.log('User roles in array:', users.map(u => ({ email: u.email, roles: u.roles })));
      console.log('=========================');
    }
  }, [users]);

  useEffect(() => {
    if (roles.length > 0) {
      console.log('=== ROLES LOADED DEBUG ===');
      console.log('Total roles:', roles.length);
      console.log('Sample role:', roles[0]);
      console.log('All roles:', roles);
      console.log('========================');
    }
  }, [roles]);

  useEffect(() => {
    // Prevent duplicate calls in development mode
    if (!hasInitialized) {
      console.log('Fetching users and roles - first call only');
      dispatch(fetchUsers());
      dispatch(fetchRoles());
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized]);

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.id]: e.target.value
    });
  };

  const handleViewUser = (user) => {
    console.log('Opening view modal for user:', user);
    console.log('User roles structure:', user.roles);
    console.log('Available roles from service:', roles);
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    console.log('Selected user for editing:', user);
    console.log('User roles data:', user.roles);
    console.log('Available roles:', roles);
    
    // Extract the role name from the roles array
    let currentRoleName = '';
    
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      // Get the first role name from the array
      currentRoleName = user.roles[0];
    }
    
    console.log('Current role name extracted:', currentRoleName);
    
    // Find the matching role from the roles array
    const matchingRole = roles.find(role => role.name === currentRoleName);
    
    console.log('Matching role found:', matchingRole);
    
    setEditFormData({
      role: matchingRole ? matchingRole.name : ''
    });
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

    const assignRolePayload = {
      userId: selectedUser.id,
      roles: [
        {
          id: selectedRole.id,
          name: selectedRole.name
        }
      ]
    };

    console.log('Assigning role payload:', assignRolePayload);
    dispatch(assignRole(assignRolePayload));
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({ role: '' });
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

  const getRoleDisplayName = (userRoles) => {
    // Debug: log actual structure
    console.log('Role debug - userRoles:', userRoles, 'roles available:', roles.length);
    
    if (!userRoles) {
      return 'N/A';
    }

    // If roles haven't loaded yet, show loading
    if (!roles || roles.length === 0) {
      return 'Loading...';
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'active';
    
    switch (statusLower) {
      case 'active':
      case 'approved':
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Active">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'inactive':
      case 'rejected':
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" title="Inactive">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" title="Pending">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" title="Unknown">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex gap-2 mb-4">
        <Button
          size="xs"
          onClick={() => setShowModal(true)}
          disabled={isLoading}
          className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Add User
        </Button>
      </div>
      <div className="bg-white rounded-xl p-16 shadow ">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>

        <Table
          striped
          className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
        >
          <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Role</TableHeadCell>
              <TableHeadCell>Date Created</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Spinner size="md" />
                    <span className="ml-2">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                    {getStatusIcon(user.status || 'Active')}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      disabled={isLoading}
                      className="p-2 text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] rounded-lg disabled:opacity-50"
                      title="View User"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      disabled={isLoading}
                      className="p-2 text-white bg-[#2D506B] hover:bg-sky-900 rounded-lg disabled:opacity-50"
                      title="Edit Role"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
          <ModalHeader>EDIT USER ROLE</ModalHeader>
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
                <Label>Current Role</Label>
                <input
                  type="text"
                  value={getRoleDisplayName(selectedUser.roles)}
                  readOnly
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="role">New Role</Label>
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
                    'Update Role'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setEditFormData({ role: '' });
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
  );
};

export default UserManagement;
