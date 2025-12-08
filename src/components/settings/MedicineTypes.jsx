import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMedkit } from 'react-icons/fa';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { toast } from 'react-toastify';
import { 
  getMedicineTypes, 
  createMedicineType, 
  updateMedicineType, 
  deleteMedicineType 
} from '../../service/apiService';

const MedicineTypes = () => {
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [formData, setFormData] = useState({
    typeName: '',
    description: ''
  });

  // Load medicine types from API
  useEffect(() => {
    loadMedicineTypes();
  }, []);

  const loadMedicineTypes = async () => {
    try {
      setLoading(true);
      const data = await getMedicineTypes();
      setMedicineTypes(data || []);
    } catch (error) {
      console.error('Error loading medicine types:', error);
      toast.error('Failed to load medicine types. Please try again.');
      // Fallback to empty array on error
      setMedicineTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingType) {
        // Update existing type
        await updateMedicineType(editingType.id, formData);
        toast.success('Medicine type updated successfully!');
      } else {
        // Add new type
        await createMedicineType(formData);
        toast.success('Medicine type added successfully!');
      }

      // Reload the data from server
      await loadMedicineTypes();
      
      setIsModalOpen(false);
      setEditingType(null);
      setFormData({ typeName: '', description: '' });
    } catch (error) {
      console.error('Error saving medicine type:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`Failed to save medicine type: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      typeName: type.typeName,
      description: type.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = (type) => {
    setTypeToDelete(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    try {
      await deleteMedicineType(typeToDelete.id);
      toast.success('Medicine type deleted successfully!');
      // Reload the data from server
      await loadMedicineTypes();
    } catch (error) {
      console.error('Error deleting medicine type:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`Failed to delete medicine type: ${errorMessage}`);
    } finally {
      setShowDeleteModal(false);
      setTypeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTypeToDelete(null);
  };

  const openAddModal = () => {
    setEditingType(null);
    setFormData({ typeName: '', description: '' });
    setIsModalOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Medicine Types</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage different types of medicines</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus />
          Add Medicine Type
        </button>
      </div>

      {/* Medicine Types Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {medicineTypes.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No medicine types found. Click "Add Medicine Type" to get started.
                </td>
              </tr>
            ) : (
              medicineTypes.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaMedkit className="text-blue-600 mr-3" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{type.typeName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{type.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
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
          <div className="relative p-8 bg-white dark:bg-gray-800 w-full max-w-md m-auto rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingType ? 'Edit Medicine Type' : 'Add Medicine Type'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.typeName}
                  onChange={(e) => setFormData({...formData, typeName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                  placeholder="Enter medicine type name"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                  disabled={saving}
                  placeholder="Enter medicine type description"
                />
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
                  {editingType ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && typeToDelete && (
        <Modal show={showDeleteModal} onClose={cancelDelete}>
          <ModalHeader>Are you sure?</ModalHeader>
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
                  Delete Medicine Type
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this medicine type? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                  <div className="flex items-center">
                    <FaMedkit className="text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{typeToDelete.typeName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{typeToDelete.description}</div>
                    </div>
                  </div>
                </div>
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

export default MedicineTypes;
