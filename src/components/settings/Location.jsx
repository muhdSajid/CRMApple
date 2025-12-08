import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { toast } from 'react-toastify';
import { 
  getLocationsFromSettings, 
  createLocation, 
  updateLocation, 
  getLocationById,
  softDeleteLocation 
} from '../../service/apiService';

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    locationAddress: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  // Load locations from API
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getLocationsFromSettings();
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations. Please try again.');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Location name must be at least 2 characters';
    }

    if (!formData.locationAddress.trim()) {
      newErrors.locationAddress = 'Location address is required';
    } else if (formData.locationAddress.trim().length < 5) {
      newErrors.locationAddress = 'Location address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        locationAddress: formData.locationAddress.trim(),
        imagePath: null // Set to null since we're not using image path
      };

      if (editingLocation) {
        // Update existing location
        await updateLocation(editingLocation.id, submitData);
        toast.success('Location updated successfully!');
      } else {
        // Add new location
        await createLocation(submitData);
        toast.success('Location added successfully!');
      }

      // Reload the data from server
      await loadLocations();
      
      setIsModalOpen(false);
      setEditingLocation(null);
      setFormData({ name: '', locationAddress: '', isActive: true });
      setErrors({});
    } catch (error) {
      console.error('Error saving location:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`Failed to save location: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (location) => {
    try {
      // Fetch the full location details
      const locationDetails = await getLocationById(location.id);
      setEditingLocation(location);
      setFormData({
        name: locationDetails.name || '',
        locationAddress: locationDetails.locationAddress || '',
        isActive: locationDetails.isActive !== undefined ? locationDetails.isActive : true
      });
      setErrors({});
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading location details:', error);
      toast.error('Failed to load location details');
    }
  };

  const handleDelete = (location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;

    try {
      await softDeleteLocation(locationToDelete.id);
      toast.success('Location deleted successfully!');
      // Reload the data from server
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`Failed to delete location: ${errorMessage}`);
    } finally {
      setShowDeleteModal(false);
      setLocationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setLocationToDelete(null);
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({ name: '', locationAddress: '', isActive: true });
    setErrors({});
    setIsModalOpen(true);
  };

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Locations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage warehouse and storage locations</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus />
          Add Location
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Location Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {locations.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No locations found. Click "Add Location" to get started.
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{location.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={location.locationAddress}>
                      {location.locationAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      location.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {location.isActive ? (
                        <><FaEye className="mr-1 mt-0.5" /> Active</>
                      ) : (
                        <><FaEyeSlash className="mr-1 mt-0.5" /> Inactive</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(location)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white dark:bg-gray-800 w-full max-w-lg m-auto rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    clearFieldError('name');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  disabled={saving}
                  placeholder="Enter location name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.locationAddress}
                  onChange={(e) => {
                    setFormData({...formData, locationAddress: e.target.value});
                    clearFieldError('locationAddress');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.locationAddress ? 'border-red-300 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                  rows="3"
                  disabled={saving}
                  placeholder="Enter full address"
                />
                {errors.locationAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.locationAddress}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Inactive locations won't be available for new operations
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={saving}
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingLocation ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <Modal show={showDeleteModal} onClose={cancelDelete}>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Delete Location
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this location? This action will soft-delete the location and it may affect existing records.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{locationToDelete.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{locationToDelete.locationAddress}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Status: {locationToDelete.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                  <strong>Note:</strong> This will soft-delete the location. Existing records will be preserved, but the location won't be available for new operations.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="text-white bg-red-600 border hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Delete
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default Location;
