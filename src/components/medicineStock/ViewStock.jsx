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
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { getPurchaseTypes, addBatch, getBatches, updateBatch } from "../../service/apiService";
import { toast } from "react-toastify";

const ViewStock = ({ isOpen, onClose, medicineId = null, locationId = null }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [purchaseTypes, setPurchaseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    expiryDate: '',
    initialQuantity: '',
    totalPrice: '',
    unitPrice: '',
    purchaseType: 'Purchase'
  });
  
  const [tableData, setTableData] = useState([]);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('ViewStock opened with:', { medicineId, locationId });
    }
  }, [isOpen, medicineId, locationId]);

  // Fetch batches when component opens and has required IDs
  useEffect(() => {
    const fetchBatches = async () => {
      if (isOpen && medicineId && locationId) {
        try {
          setBatchLoading(true);
          console.log('Fetching batches for medicine:', medicineId, 'location:', locationId);
          const response = await getBatches(locationId, medicineId);
          
          // Transform API response to match UI structure
          const transformedData = response.map(batch => {
            // Find purchase type name from purchaseTypes array
            const purchaseTypeName = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId)?.name || 'Unknown';
            
            return {
              id: batch.id,
              batchName: batch.batchName,
              expiryDate: batch.expiryDate.split('T')[0], // Convert from ISO to YYYY-MM-DD
              initialQuantity: batch.initialQuantity,
              currentQuantity: batch.currentQuantity,
              totalPrice: batch.totalPrice,
              unitPrice: batch.unitPrice,
              purchaseType: purchaseTypeName,
              createdAt: batch.createdAt,
              createdBy: batch.createdBy,
              lastUpdatedAt: batch.lastUpdatedAt,
              lastModifiedBy: batch.lastModifiedBy,
              isActive: batch.isActive
            };
          });
          
          console.log('Transformed batch data:', transformedData);
          setTableData(transformedData);
        } catch (error) {
          console.error('Error fetching batches:', error);
          toast.error(`Failed to fetch batches: ${error.message}`);
          // Keep empty array on error
          setTableData([]);
        } finally {
          setBatchLoading(false);
        }
      } else if (isOpen) {
        // Clear data if IDs are missing
        setTableData([]);
      }
    };

    // Only fetch if we have purchase types loaded (to get proper names)
    if (purchaseTypes.length > 0) {
      fetchBatches();
    }
  }, [isOpen, medicineId, locationId, purchaseTypes]);

  // Fetch purchase types when component mounts
  useEffect(() => {
    const fetchPurchaseTypes = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          console.log('Fetching purchase types...');
          const response = await getPurchaseTypes();
          console.log('Purchase types response:', response);
          setPurchaseTypes(response || []);
        } catch (error) {
          console.error('Error fetching purchase types:', error);
          toast.error('Failed to fetch purchase types');
          // Fallback data matching API structure
          const fallbackData = [
            { id: 1, name: 'Purchase', description: 'Purchase items' },
            { id: 2, name: 'Donation', description: 'Donated items' }
          ];
          console.log('Using fallback purchase types:', fallbackData);
          setPurchaseTypes(fallbackData);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPurchaseTypes();
  }, [isOpen]);

  const handleEdit = (index) => {
    setEditingRow(index);
  };

  const handleSave = async (index) => {
    try {
      setLoading(true);
      const item = tableData[index];
      
      // Prepare the update data with only the editable fields
      const updateData = {
        batchName: item.batchName,
        expiryDate: `${item.expiryDate}T00:00:00` // Convert to ISO 8601 format
      };
      
      console.log('Updating batch ID:', item.id, 'with data:', updateData);
      
      // Call the API to update the batch
      await updateBatch(item.id, updateData);
      
      // Refresh the batches list after successful update
      const updatedBatches = await getBatches(locationId, medicineId);
      
      // Transform and update the table data
      const transformedData = updatedBatches.map(batch => {
        const purchaseTypeName = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId)?.name || 'Unknown';
        
        return {
          id: batch.id,
          batchName: batch.batchName,
          expiryDate: batch.expiryDate.split('T')[0],
          initialQuantity: batch.initialQuantity,
          currentQuantity: batch.currentQuantity,
          totalPrice: batch.totalPrice,
          unitPrice: batch.unitPrice,
          purchaseType: purchaseTypeName,
          createdAt: batch.createdAt,
          createdBy: batch.createdBy,
          lastUpdatedAt: batch.lastUpdatedAt,
          lastModifiedBy: batch.lastModifiedBy,
          isActive: batch.isActive
        };
      });
      
      setTableData(transformedData);
      setEditingRow(null);
      toast.success('Batch updated successfully');
    } catch (error) {
      console.error('Error updating batch:', error);
      
      // Extract more meaningful error message
      let errorMessage = 'Unknown error';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to update batch: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleAddBatch = () => {
    setShowAddForm(true);
  };

  const handleAddBatchSave = async () => {
    // Validation checks
    if (!newBatch.batchName || !newBatch.expiryDate || !newBatch.initialQuantity || !newBatch.totalPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!medicineId || !locationId) {
      toast.error('Medicine ID and Location ID are required');
      console.error('Missing required IDs:', { medicineId, locationId });
      return;
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(newBatch.expiryDate);
    const today = new Date();
    if (expiryDate <= today) {
      toast.error('Expiry date must be in the future');
      return;
    }

    // Validate quantities and prices are positive
    if (parseFloat(newBatch.initialQuantity) <= 0) {
      toast.error('Initial quantity must be greater than 0');
      return;
    }
    
    if (parseFloat(newBatch.totalPrice) <= 0) {
      toast.error('Total price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      
      // Find the purchase type ID from the purchaseTypes array
      const selectedPurchaseType = purchaseTypes.find(type => type.name === newBatch.purchaseType);
      const purchaseTypeId = selectedPurchaseType ? selectedPurchaseType.id : 1; // fallback to 1 if not found
      
      console.log('Selected purchase type:', selectedPurchaseType, 'ID:', purchaseTypeId);

      // Prepare the batch data for API call
      const batchData = {
        batchName: newBatch.batchName,
        medicineId: medicineId,
        expiryDate: `${newBatch.expiryDate}T23:59:59`, // Convert to ISO 8601 format
        initialQuantity: parseInt(newBatch.initialQuantity),
        currentQuantity: parseInt(newBatch.initialQuantity), // Initially same as initial quantity
        totalPrice: parseFloat(newBatch.totalPrice),
        unitPrice: parseFloat(newBatch.unitPrice),
        purchaseTypeId: purchaseTypeId,
        locationId: locationId,
        isActive: true
      };

      console.log('Sending batch data to API:', batchData);
      
      // Call the API to add the batch
      const response = await addBatch(batchData);
      console.log('API response:', response);

      // Refresh the batches list after successful addition
      const updatedBatches = await getBatches(locationId, medicineId);
      
      // Transform and update the table data
      const transformedData = updatedBatches.map(batch => {
        const purchaseTypeName = purchaseTypes.find(pt => pt.id === batch.purchaseTypeId)?.name || 'Unknown';
        
        return {
          id: batch.id,
          batchName: batch.batchName,
          expiryDate: batch.expiryDate.split('T')[0],
          initialQuantity: batch.initialQuantity,
          currentQuantity: batch.currentQuantity,
          totalPrice: batch.totalPrice,
          unitPrice: batch.unitPrice,
          purchaseType: purchaseTypeName,
          createdAt: batch.createdAt,
          createdBy: batch.createdBy,
          lastUpdatedAt: batch.lastUpdatedAt,
          lastModifiedBy: batch.lastModifiedBy,
          isActive: batch.isActive
        };
      });
      
      setTableData(transformedData);
      setShowAddForm(false);
      setNewBatch({
        batchName: '',
        expiryDate: '',
        initialQuantity: '',
        totalPrice: '',
        unitPrice: '',
        purchaseType: 'Purchase'
      });
      
      toast.success('New batch added successfully');
    } catch (error) {
      console.error('Error adding batch:', error);
      
      // Extract more meaningful error message
      let errorMessage = 'Unknown error';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to add batch: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatchCancel = () => {
    setShowAddForm(false);
    setNewBatch({
      batchName: '',
      expiryDate: '',
      initialQuantity: '',
      totalPrice: '',
      unitPrice: '',
      purchaseType: 'Purchase'
    });
  };

  const handleNewBatchChange = (field, value) => {
    const updatedBatch = { ...newBatch, [field]: value };

    // Auto-calculate unit price when initial quantity or total price changes
    if (field === 'initialQuantity' || field === 'totalPrice') {
      const quantity = parseFloat(updatedBatch.initialQuantity) || 0;
      const totalPrice = parseFloat(updatedBatch.totalPrice) || 0;
      updatedBatch.unitPrice = quantity > 0 ? (totalPrice / quantity).toFixed(2) : 0;
    }

    // Recalculate total price when unit price changes
    if (field === 'unitPrice') {
      const quantity = parseFloat(updatedBatch.initialQuantity) || 0;
      const unitPrice = parseFloat(value) || 0;
      updatedBatch.totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setNewBatch(updatedBatch);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      const updatedData = tableData.filter((_, i) => i !== index);
      setTableData(updatedData);
      toast.success('Stock entry deleted successfully');
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;

    // Auto-calculate unit price when initial quantity or total price changes
    if (field === 'initialQuantity' || field === 'totalPrice') {
      const quantity = parseFloat(updatedData[index].initialQuantity) || 0;
      const totalPrice = parseFloat(updatedData[index].totalPrice) || 0;
      updatedData[index].unitPrice = quantity > 0 ? (totalPrice / quantity).toFixed(2) : 0;
    }

    // Recalculate total price when unit price changes
    if (field === 'unitPrice') {
      const quantity = parseFloat(updatedData[index].initialQuantity) || 0;
      const unitPrice = parseFloat(value) || 0;
      updatedData[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setTableData(updatedData);
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
    <Modal 
      show={isOpen} 
      size="7xl" 
      onClose={onClose} 
      className="[&>div]:!max-w-[75%]"
    >
      <ModalHeader>
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Medicine Stock</h2>
            {(!medicineId || !locationId) && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Medicine ID: {medicineId || 'Missing'} | Location ID: {locationId || 'Missing'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {loading && <Spinner size="sm" />}
            <button
              onClick={handleAddBatch}
              disabled={!medicineId || !locationId}
              className={`flex items-center justify-center w-8 h-8 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                !medicineId || !locationId 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title={!medicineId || !locationId ? "Missing Medicine ID or Location ID" : "Add New Batch"}
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        {(!medicineId || !locationId) && (
          <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-800">
                  Unable to add new batches
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Medicine ID and Location ID are required to add new batches. Please select a specific medicine from the stock list.
                </p>
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
              {batchLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-gray-500">Loading batches...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (!medicineId || !locationId) ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-orange-600">Please select a specific medicine to view batches</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500">No batches found for this medicine</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {showAddForm && (
                <TableRow className="bg-blue-50 border-2 border-blue-300 shadow-sm">
                  <TableCell>
                    <input
                      type="text"
                      placeholder="Enter batch name"
                      value={newBatch.batchName}
                      onChange={(e) => handleNewBatchChange('batchName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="date"
                      value={newBatch.expiryDate}
                      min={getTodayDate()}
                      onChange={(e) => handleNewBatchChange('expiryDate', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={newBatch.initialQuantity}
                      onChange={(e) => handleNewBatchChange('initialQuantity', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      placeholder="Current qty"
                      value={newBatch.initialQuantity}
                      disabled
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-100 text-gray-600"
                      title="Current quantity will be same as initial quantity for new batch"
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
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </TableCell>
                  
                  <TableCell className="w-40">
                    <select
                      value={newBatch.purchaseType}
                      onChange={(e) => handleNewBatchChange('purchaseType', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {purchaseTypes.length > 0 ? (
                        purchaseTypes.map((type) => (
                          <option key={type.id} value={type.name} className="py-1">
                            {type.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Purchase" className="py-1">Purchase</option>
                          <option value="Donation" className="py-1">Donation</option>
                        </>
                      )}
                    </select>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={handleAddBatchSave}
                        disabled={loading}
                        className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:bg-gray-400"
                        title={loading ? 'Saving...' : 'Save'}
                      >
                        {loading ? <Spinner size="xs" /> : <FaCheck size={12} />}
                      </button>
                      <button
                        onClick={handleAddBatchCancel}
                        className="flex items-center justify-center w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                        title="Cancel"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {tableData.map((item, index) => (
                <TableRow 
                  key={item.id || index}
                  className={editingRow === index ? "bg-yellow-50 border-2 border-yellow-300 shadow-sm" : ""}
                >
                  <TableCell className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`w-3 h-3 rounded-full ${item.badge}`}></span>
                    )}
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={item.batchName}
                        onChange={(e) => handleFieldChange(index, 'batchName', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                        className="w-full px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    ) : (
                      formatDate(item.expiryDate)
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <div className="px-2 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded">
                        {item.initialQuantity}
                      </div>
                    ) : (
                      item.initialQuantity
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <div className="px-2 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                          <span>{item.currentQuantity || item.initialQuantity}</span>
                          {item.currentQuantity < item.initialQuantity && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                              Used: {item.initialQuantity - item.currentQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{item.currentQuantity || item.initialQuantity}</span>
                        {item.currentQuantity < item.initialQuantity && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">
                            Used: {item.initialQuantity - item.currentQuantity}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <div className="px-2 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded">
                        ₹{parseFloat(item.totalPrice).toFixed(2)}
                      </div>
                    ) : (
                      `₹${parseFloat(item.totalPrice).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingRow === index ? (
                      <div className="px-2 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded">
                        ₹{parseFloat(item.unitPrice).toFixed(2)}
                      </div>
                    ) : (
                      `₹${parseFloat(item.unitPrice).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell className="w-40">
                    {editingRow === index ? (
                      <div className="flex justify-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm opacity-60 ${
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
                          <button
                            onClick={() => handleSave(index)}
                            disabled={loading}
                            className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:bg-gray-400"
                            title={loading ? 'Updating...' : 'Save'}
                          >
                            {loading ? <Spinner size="xs" /> : <FaCheck size={12} />}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex items-center justify-center w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 disabled:bg-gray-400"
                            title="Cancel"
                          >
                            <FaTimes size={12} />
                          </button>
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
                          <button 
                            onClick={() => handleDelete(index)}
                            className="text-gray-600 hover:text-red-500 p-1"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewStock;
