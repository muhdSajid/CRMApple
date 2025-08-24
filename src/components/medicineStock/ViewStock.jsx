import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Label,
  Select,
  Spinner,
} from "flowbite-react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { getPurchaseTypes, createBatch, getLocations, getAvailableBatches, updateBatch, softDeleteBatch, getMedicineDetails } from "../../service/apiService";
import { toast } from "react-toastify";

const ViewStock = ({ isOpen, onClose, selectedMedicineId = null, selectedLocationId = null, medicineData = null, onBatchAdded = null }) => {
  console.log('ViewStock component rendered with selectedMedicineId:', selectedMedicineId);
  console.log('ViewStock component rendered with selectedLocationId:', selectedLocationId);
  console.log('ViewStock component rendered with medicineData:', medicineData);
  
  const [editingRow, setEditingRow] = useState(null);
  const [purchaseTypes, setPurchaseTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showDeletePopover, setShowDeletePopover] = useState(null); // null or index of item to delete
  const [completeMedicineData, setCompleteMedicineData] = useState(null); // Store complete medicine data
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    medicineId: '', // Will be set by useEffect when selectedMedicineId is available
    expiryDate: '',
    initialQuantity: '',
    currentQuantity: '',
    totalPrice: '',
    unitPrice: '',
    purchaseTypeId: 1,
    locationId: '', // Will be set by useEffect when locations are available
    isActive: true
  });

  // Fetch purchase types and locations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          console.log('Fetching data...');
          
          // Fetch required data concurrently
          const [purchaseTypesResponse, locationsResponse] = await Promise.allSettled([
            getPurchaseTypes(),
            getLocations()
          ]);

          // Handle purchase types
          if (purchaseTypesResponse.status === 'fulfilled') {
            console.log('Purchase types response:', purchaseTypesResponse.value);
            setPurchaseTypes(purchaseTypesResponse.value || []);
          } else {
            console.error('Error fetching purchase types:', purchaseTypesResponse.reason);
            toast.error('Failed to fetch purchase types');
            // Fallback data
            setPurchaseTypes([
              { id: 1, name: 'Purchase', description: 'Purchase items' },
              { id: 2, name: 'Donation', description: 'Donated items' }
            ]);
          }

          // Handle locations
          if (locationsResponse.status === 'fulfilled') {
            console.log('Locations response:', locationsResponse.value);
            setLocations(locationsResponse.value || []);
          } else {
            console.error('Error fetching locations:', locationsResponse.reason);
            toast.error('Failed to fetch locations');
            setLocations([]);
          }

        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to fetch required data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch complete medicine details if stock threshold is missing
  useEffect(() => {
    const fetchCompleteMedicineData = async () => {
      if (isOpen && selectedMedicineId && medicineData) {
        // Check if stockThreshold is missing or undefined
        if (medicineData.stockThreshold === undefined || medicineData.stockThreshold === null) {
          try {
            console.log('Stock threshold missing, fetching complete medicine details...');
            const medicineDetails = await getMedicineDetails(selectedMedicineId);
            console.log('Complete medicine details:', medicineDetails);
            
            // Update the complete medicine data with proper stock threshold
            setCompleteMedicineData({
              ...medicineData,
              stockThreshold: medicineDetails.stockThreshold || 0
            });
          } catch (error) {
            console.error('Error fetching complete medicine details:', error);
            // Use the original data with 0 as fallback
            setCompleteMedicineData({
              ...medicineData,
              stockThreshold: 0
            });
          }
        } else {
          // Use the passed medicine data if stock threshold is available
          setCompleteMedicineData(medicineData);
        }
      }
    };

    fetchCompleteMedicineData();
  }, [isOpen, selectedMedicineId, medicineData]);

  // Fetch available batches when modal opens and selectedMedicineId is available
  useEffect(() => {
    const fetchBatches = async () => {
      if (isOpen && selectedMedicineId && (selectedLocationId || locations.length > 0)) {
        try {
          setLoading(true);
          
          // Use selectedLocationId if provided, otherwise fall back to first location
          const locationId = selectedLocationId || locations[0]?.id;
          
          if (!locationId) {
            console.error('No location ID available for batch fetch');
            setTableData([]);
            return;
          }
          
          console.log('Fetching batches for medicineId:', selectedMedicineId, 'and locationId:', locationId);
          
          const batchesResponse = await getAvailableBatches(locationId, selectedMedicineId);
          console.log('Batches response:', batchesResponse);
          
          // Transform the API response to match the existing table structure
          const transformedBatches = batchesResponse.map(batch => {
            // Find purchase type name based on purchaseTypeId
            const purchaseType = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId);
            
            return {
              id: batch.id,
              batchName: batch.batchName,
              expiryDate: batch.expiryDate.split('T')[0], // Format date for display
              initialQuantity: batch.initialQuantity,
              currentQuantity: batch.currentQuantity,
              totalPrice: batch.totalPrice,
              unitPrice: batch.unitPrice,
              purchaseType: purchaseType ? purchaseType.name : (batch.purchaseTypeId === 1 ? 'Purchase' : 'Donation'),
              medicineId: batch.medicineId,
              locationId: batch.locationId,
              isActive: batch.isActive
            };
          });
          
          setTableData(transformedBatches);
        } catch (error) {
          console.error('Error fetching batches:', error);
          toast.error('Failed to fetch batch data');
          // Keep empty array on error
          setTableData([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBatches();
  }, [isOpen, selectedMedicineId, selectedLocationId, locations, purchaseTypes]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeletePopover !== null && !event.target.closest('.delete-popover-container')) {
        setShowDeletePopover(null);
      }
    };

    if (showDeletePopover !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeletePopover]);

  // Update selected medicine when prop changes
  useEffect(() => {
    if (selectedMedicineId) {
      setNewBatch(prev => ({
        ...prev,
        medicineId: selectedMedicineId
      }));
    }
  }, [selectedMedicineId]);

  // Update location ID when locations are loaded or selectedLocationId changes
  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      // Use the passed selectedLocationId
      setNewBatch(prev => ({
        ...prev,
        locationId: selectedLocationId
      }));
    } else if (locations.length > 0 && !newBatch.locationId) {
      // Fallback to first location if no selectedLocationId is provided
      setNewBatch(prev => ({
        ...prev,
        locationId: locations[0].id
      }));
    }
  }, [locations, selectedLocationId, newBatch.locationId]);

  const handleEdit = (index) => {
    setEditingRow(index);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentItem = tableData[editingRow];
      
      // Prepare update data with only editable fields
      const updateData = {
        batchName: currentItem.batchName,
        expiryDate: new Date(currentItem.expiryDate).toISOString()
      };
      
      console.log('Updating batch with ID:', currentItem.id, 'and data:', updateData);
      
      // Call the API to update the batch
      await updateBatch(currentItem.id, updateData);
      
      // Refresh the batch list after successful update
      if ((selectedLocationId || locations.length > 0) && selectedMedicineId) {
        const locationId = selectedLocationId || locations[0]?.id;
        if (locationId) {
          const updatedBatches = await getAvailableBatches(locationId, selectedMedicineId);
        
          // Transform the updated response
          const transformedBatches = updatedBatches.map(batch => {
            const purchaseType = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId);
            
            return {
              id: batch.id,
              batchName: batch.batchName,
              expiryDate: batch.expiryDate.split('T')[0],
              initialQuantity: batch.initialQuantity,
              currentQuantity: batch.currentQuantity,
              totalPrice: batch.totalPrice,
              unitPrice: batch.unitPrice,
              purchaseType: purchaseType ? purchaseType.name : (batch.purchaseTypeId === 1 ? 'Purchase' : 'Donation'),
              medicineId: batch.medicineId,
              locationId: batch.locationId,
              isActive: batch.isActive
            };
          });
          
          setTableData(transformedBatches);
        }
      }
      
      setEditingRow(null);
      toast.success('Batch updated successfully');
      
      // Notify parent component to refresh medicine data
      if (onBatchAdded) {
        console.log('Calling onBatchAdded callback to refresh parent data after batch update');
        onBatchAdded();
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error(`Failed to update batch: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleAddBatch = () => {
    console.log('Opening add batch form with selectedMedicineId:', selectedMedicineId);
    console.log('Available locations:', locations);
    setShowAddForm(true);
    // Reset form with proper defaults, ensuring medicineId and locationId are set
    const formData = {
      batchName: '',
      medicineId: selectedMedicineId || '', // Use selectedMedicineId directly
      expiryDate: '',
      initialQuantity: '',
      currentQuantity: '',
      totalPrice: '',
      unitPrice: '',
      purchaseTypeId: purchaseTypes.length > 0 ? purchaseTypes[0].id : 1,
      locationId: selectedLocationId || (locations.length > 0 ? locations[0].id : 1), // Use selectedLocationId if available
      isActive: true
    };
    console.log('Setting form data:', formData);
    setNewBatch(formData);
  };

  const handleAddBatchSave = async () => {
    console.log('Attempting to save batch with data:', newBatch);
    console.log('selectedMedicineId:', selectedMedicineId);
    console.log('Available locations:', locations);
    
    // Validate required fields - medicineId and locationId are auto-set
    if (!newBatch.batchName || !newBatch.expiryDate || 
        !newBatch.initialQuantity || !newBatch.totalPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure medicineId is set from the selected medicine
    if (!selectedMedicineId) {
      console.error('Medicine ID validation failed:', { 
        newBatchMedicineId: newBatch.medicineId, 
        selectedMedicineId,
        isOpen,
        showAddForm
      });
      toast.error(`Medicine ID is missing (${selectedMedicineId}). Please close and reopen from a specific medicine.`);
      return;
    }

    // Ensure locationId is set (use selectedLocationId if available, otherwise use default)
    const locationId = selectedLocationId || newBatch.locationId || (locations.length > 0 ? locations[0].id : 1);
    console.log('Using locationId:', locationId);
    
    if (!locationId) {
      toast.error('Location ID is required. Please try again.');
      return;
    }

    try {
      setSaving(true);
      
      // Format the data according to the API schema
      const batchData = {
        batchName: newBatch.batchName,
        medicineId: parseInt(selectedMedicineId), // Use selectedMedicineId directly
        expiryDate: new Date(newBatch.expiryDate).toISOString(),
        initialQuantity: parseInt(newBatch.initialQuantity),
        currentQuantity: parseInt(newBatch.currentQuantity || newBatch.initialQuantity),
        totalPrice: parseFloat(newBatch.totalPrice),
        unitPrice: parseFloat(newBatch.unitPrice),
        purchaseTypeId: parseInt(newBatch.purchaseTypeId),
        locationId: parseInt(locationId), // Use the validated locationId
        isActive: newBatch.isActive
      };

      console.log('Saving batch with data:', batchData);
      
      // Call the API to create the batch
      const createdBatch = await createBatch(batchData);
      console.log('Batch created successfully:', createdBatch);

      // Refresh the batch list by fetching updated data from API
      if (selectedLocationId || locations.length > 0) {
        const refreshLocationId = selectedLocationId || locations[0]?.id;
        if (refreshLocationId) {
          const updatedBatches = await getAvailableBatches(refreshLocationId, selectedMedicineId);
        
          // Transform the updated response
          const transformedBatches = updatedBatches.map(batch => {
            const purchaseType = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId);
            
            return {
              id: batch.id,
              batchName: batch.batchName,
              expiryDate: batch.expiryDate.split('T')[0],
              initialQuantity: batch.initialQuantity,
              currentQuantity: batch.currentQuantity,
              totalPrice: batch.totalPrice,
              unitPrice: batch.unitPrice,
              purchaseType: purchaseType ? purchaseType.name : (batch.purchaseTypeId === 1 ? 'Purchase' : 'Donation'),
              medicineId: batch.medicineId,
              locationId: batch.locationId,
              isActive: batch.isActive
            };
          });
          
          setTableData(transformedBatches);
        }
      }
      setShowAddForm(false);
      
      // Reset form
      setNewBatch({
        batchName: '',
        medicineId: selectedMedicineId || '', // Use selectedMedicineId directly
        expiryDate: '',
        initialQuantity: '',
        currentQuantity: '',
        totalPrice: '',
        unitPrice: '',
        purchaseTypeId: purchaseTypes.length > 0 ? purchaseTypes[0].id : 1,
        locationId: locations.length > 0 ? locations[0].id : 1, // Default to 1 if no locations loaded yet
        isActive: true
      });
      
      toast.success('New batch added successfully');
      
      // Notify parent component to refresh medicine data
      if (onBatchAdded) {
        console.log('Calling onBatchAdded callback to refresh parent data');
        onBatchAdded();
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error(`Failed to save batch: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBatchCancel = () => {
    setShowAddForm(false);
    setNewBatch({
      batchName: '',
      medicineId: selectedMedicineId || '', // Use selectedMedicineId directly
      expiryDate: '',
      initialQuantity: '',
      currentQuantity: '',
      totalPrice: '',
      unitPrice: '',
      purchaseTypeId: purchaseTypes.length > 0 ? purchaseTypes[0].id : 1,
      locationId: selectedLocationId || (locations.length > 0 ? locations[0].id : 1), // Use selectedLocationId if available
      isActive: true
    });
  };

  const handleNewBatchChange = (field, value) => {
    const updatedBatch = { ...newBatch, [field]: value };

    // Auto-set current quantity to always equal initial quantity
    if (field === 'initialQuantity') {
      updatedBatch.currentQuantity = value;
    }

    // Auto-calculate unit price when initial quantity or total price changes (but not when unitPrice is manually changed)
    if (field === 'initialQuantity' || field === 'totalPrice') {
      const quantity = parseFloat(updatedBatch.initialQuantity) || 0;
      const totalPrice = parseFloat(updatedBatch.totalPrice) || 0;
      updatedBatch.unitPrice = quantity > 0 ? (totalPrice / quantity).toFixed(2) : 0;
    }
    
    // If unit price is manually changed, also update total price accordingly
    if (field === 'unitPrice') {
      const quantity = parseFloat(updatedBatch.initialQuantity) || 0;
      const unitPrice = parseFloat(value) || 0;
      if (quantity > 0 && unitPrice > 0) {
        updatedBatch.totalPrice = (quantity * unitPrice).toFixed(2);
      }
    }

    setNewBatch(updatedBatch);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;

    // Auto-set current quantity to always equal initial quantity
    if (field === 'initialQuantity') {
      updatedData[index].currentQuantity = value;
    }

    // Auto-calculate unit price when initial quantity or total price changes
    if (field === 'initialQuantity' || field === 'totalPrice') {
      const quantity = parseFloat(updatedData[index].initialQuantity) || 0;
      const totalPrice = parseFloat(updatedData[index].totalPrice) || 0;
      updatedData[index].unitPrice = quantity > 0 ? (totalPrice / quantity).toFixed(2) : 0;
    }

    setTableData(updatedData);
  };

  const handleDelete = (index) => {
    setShowDeletePopover(index);
  };

  const confirmDelete = async (index) => {
    try {
      setSaving(true);
      const currentItem = tableData[index];
      
      console.log('Soft deleting batch with ID:', currentItem.id);
      
      // Call the API to soft delete the batch
      await softDeleteBatch(currentItem.id);
      
      // Refresh the batch list after successful deletion
      if ((selectedLocationId || locations.length > 0) && selectedMedicineId) {
        const locationId = selectedLocationId || locations[0]?.id;
        if (locationId) {
          const updatedBatches = await getAvailableBatches(locationId, selectedMedicineId);
        
          // Transform the updated response
          const transformedBatches = updatedBatches.map(batch => {
            const purchaseType = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId);
            
            return {
              id: batch.id,
              batchName: batch.batchName,
              expiryDate: batch.expiryDate.split('T')[0],
              initialQuantity: batch.initialQuantity,
              currentQuantity: batch.currentQuantity,
              totalPrice: batch.totalPrice,
              unitPrice: batch.unitPrice,
              purchaseType: purchaseType ? purchaseType.name : (batch.purchaseTypeId === 1 ? 'Purchase' : 'Donation'),
              medicineId: batch.medicineId,
              locationId: batch.locationId,
              isActive: batch.isActive
            };
          });
          
          setTableData(transformedBatches);
        }
      } else {
        // Fallback: Remove from local state if API refresh fails
        const updatedData = tableData.filter((_, i) => i !== index);
        setTableData(updatedData);
      }
      
      setShowDeletePopover(null);
      toast.success('Batch deleted successfully');
      
      // Notify parent component to refresh medicine data
      if (onBatchAdded) {
        console.log('Calling onBatchAdded callback to refresh parent data after batch deletion');
        onBatchAdded();
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error(`Failed to delete batch: ${error.message || 'Unknown error'}`);
      setShowDeletePopover(null);
    } finally {
      setSaving(false);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopover(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal show={isOpen} size="7xl" onClose={onClose} className="h-[90vh]">
      <ModalHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold">Medicine Stock</h2>
          <div className="flex items-center gap-4">
            {loading && <Spinner size="sm" />}
            <button
              onClick={handleAddBatch}
              className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              title="Add New Batch"
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="h-[75vh] overflow-y-auto pb-20">
        {/* Medicine Information Section */}
        {completeMedicineData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Medicine Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Medicine Name</div>
                <div className="text-lg font-semibold text-gray-800">{completeMedicineData.medicineName}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Medicine Type</div>
                <div className="text-lg font-semibold text-gray-800">
                  {completeMedicineData.medicineTypeName || 'N/A'}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Stock Threshold</div>
                <div className="text-lg font-semibold text-gray-800">
                  {completeMedicineData.stockThreshold !== undefined ? completeMedicineData.stockThreshold : 0} units
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table
            hoverable
            striped
            className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
          >
            <TableHead className="[&>tr>th]:bg-sky-900 text-white">
              <TableRow>
                <TableHeadCell>Batch Name</TableHeadCell>
                <TableHeadCell>Expiry Date</TableHeadCell>
                <TableHeadCell>Initial Qty</TableHeadCell>
                <TableHeadCell>Current Qty</TableHeadCell>
                <TableHeadCell>Total Price</TableHeadCell>
                <TableHeadCell>Unit Price</TableHeadCell>
                <TableHeadCell className="w-40">Purchase Type</TableHeadCell>
                <TableHeadCell className="text-center">Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {showAddForm && (
                <TableRow className="bg-green-50 border-2 border-green-200">
                  <TableCell>
                    <input
                      type="text"
                      placeholder="Enter batch name"
                      value={newBatch.batchName}
                      onChange={(e) => handleNewBatchChange('batchName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="date"
                      value={newBatch.expiryDate}
                      min={getTodayDate()}
                      onChange={(e) => handleNewBatchChange('expiryDate', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={newBatch.initialQuantity}
                      onChange={(e) => handleNewBatchChange('initialQuantity', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </TableCell>

                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      placeholder="Current qty"
                      value={newBatch.currentQuantity}
                      readOnly
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 cursor-not-allowed focus:outline-none"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Total price"
                      value={newBatch.totalPrice}
                      onChange={(e) => handleNewBatchChange('totalPrice', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit price"
                      value={newBatch.unitPrice}
                      onChange={(e) => handleNewBatchChange('unitPrice', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </TableCell>
                  
                  <TableCell className="w-40">
                    <select
                      value={newBatch.purchaseTypeId}
                      onChange={(e) => handleNewBatchChange('purchaseTypeId', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {purchaseTypes.length > 0 ? (
                        purchaseTypes.map((type) => (
                          <option key={type.id} value={type.id} className="py-1">
                            {type.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value={1} className="py-1">Purchase</option>
                          <option value={2} className="py-1">Donation</option>
                        </>
                      )}
                    </select>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        size="xs"
                        onClick={handleAddBatchSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {saving ? <Spinner size="xs" className="mr-1" /> : null}
                        Save
                      </Button>
                      <Button
                        size="xs"
                        onClick={handleAddBatchCancel}
                        disabled={saving}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {tableData.map((item, index) => (
                <TableRow key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <TableCell className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`w-3 h-3 rounded-full ${item.badge}`}></span>
                    )}
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={item.batchName}
                        onChange={(e) => handleFieldChange(index, 'batchName', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      item.batchName
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="date"
                        value={item.expiryDate}
                        min={getTodayDate()}
                        onChange={(e) => handleFieldChange(index, 'expiryDate', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      formatDate(item.expiryDate)
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="number"
                        min="1"
                        value={item.initialQuantity}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                      />
                    ) : (
                      item.initialQuantity
                    )}
                  </TableCell>

                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="number"
                        min="0"
                        value={item.currentQuantity}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                      />
                    ) : (
                      item.currentQuantity
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.totalPrice}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                      />
                    ) : (
                      `₹${parseFloat(item.totalPrice).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                      />
                    ) : (
                      `₹${parseFloat(item.unitPrice).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell className="w-40">
                    {editingRow === index ? (
                      <div className="flex justify-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                          item.purchaseType === 'Donation' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {item.purchaseType}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                          item.purchaseType === 'Donation' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {item.purchaseType}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex justify-center items-center gap-2">
                      {editingRow === index ? (
                        <>
                          <Button
                            size="xs"
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {saving ? <Spinner size="xs" className="mr-1" /> : null}
                            Save
                          </Button>
                          <Button
                            size="xs"
                            onClick={handleCancel}
                            disabled={saving}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(index)}
                            className="text-gray-600 hover:text-blue-500 p-1"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <div className="relative inline-block delete-popover-container">
                            <button 
                              onClick={() => handleDelete(index)}
                              className="text-gray-600 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                            {showDeletePopover === index && (
                              <div className={`absolute right-8 top-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[100] min-w-[200px] ${
                                index >= tableData.length - 2 ? 'translate-y-[-50%]' : 'translate-y-0'
                              }`}>
                                <p className="text-sm text-gray-700 mb-3">
                                  Delete this batch?
                                </p>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={cancelDelete}
                                    disabled={saving}
                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(index)}
                                    disabled={saving}
                                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 flex items-center"
                                  >
                                    {saving && <Spinner size="xs" className="mr-1" />}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewStock;
