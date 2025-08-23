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
import { getPurchaseTypes } from "../../service/apiService";
import { toast } from "react-toastify";

const ViewStock = ({ isOpen, onClose }) => {
  const [editingRow, setEditingRow] = useState(null);
  const [purchaseTypes, setPurchaseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchName: '',
    expiryDate: '',
    initialQuantity: '',
    totalPrice: '',
    unitPrice: '',
    purchaseType: 'Purchase'
  });
  
  const [tableData, setTableData] = useState([
    {
      id: 1,
      batchName: "CBC182201",
      expiryDate: "2025-04-01",
      initialQuantity: 100,
      totalPrice: 5000,
      unitPrice: 50,
      purchaseType: "Purchase",
      color: "bg-red-100",
      badge: "bg-red-600",
    },
    {
      id: 2,
      batchName: "CBC182202",
      expiryDate: "2025-06-15",
      initialQuantity: 50,
      totalPrice: 3000,
      unitPrice: 60,
      purchaseType: "Donation",
      color: "bg-orange-100",
      badge: "bg-orange-600",
    },
    {
      id: 3,
      batchName: "CBC182203",
      expiryDate: "2025-12-20",
      initialQuantity: 200,
      totalPrice: 8000,
      unitPrice: 40,
      purchaseType: "Purchase",
    },
    {
      id: 4,
      batchName: "CBC182204",
      expiryDate: "2026-03-10",
      initialQuantity: 75,
      totalPrice: 4500,
      unitPrice: 60,
      purchaseType: "Donation",
    },
  ]);

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

  const handleSave = (index) => {
    setEditingRow(null);
    toast.success('Stock updated successfully');
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleAddBatch = () => {
    setShowAddForm(true);
  };

  const handleAddBatchSave = () => {
    if (!newBatch.batchName || !newBatch.expiryDate || !newBatch.initialQuantity || !newBatch.totalPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    const nextId = Math.max(...tableData.map(item => item.id), 0) + 1;
    const batchToAdd = {
      ...newBatch,
      id: nextId,
      initialQuantity: parseInt(newBatch.initialQuantity),
      totalPrice: parseFloat(newBatch.totalPrice),
      unitPrice: parseFloat(newBatch.unitPrice)
    };

    setTableData([...tableData, batchToAdd]);
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
    <Modal show={isOpen} size="7xl" onClose={onClose}>
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
      <ModalBody>
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
                <TableHeadCell>Initial Quantity</TableHeadCell>
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
                    />
                  </TableCell>
                  
                  <TableCell>
                    <input
                      type="date"
                      value={newBatch.expiryDate}
                      min={getTodayDate()}
                      onChange={(e) => handleNewBatchChange('expiryDate', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
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
                      value={newBatch.purchaseType}
                      onChange={(e) => handleNewBatchChange('purchaseType', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      <Button
                        size="xs"
                        onClick={handleAddBatchSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        onClick={handleAddBatchCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {tableData.map((item, index) => (
                <TableRow key={item.id || index}>
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
                        onChange={(e) => handleFieldChange(index, 'initialQuantity', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        step="0.01"
                        value={item.totalPrice}
                        onChange={(e) => handleFieldChange(index, 'totalPrice', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        onChange={(e) => handleFieldChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      `₹${parseFloat(item.unitPrice).toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell className="w-40">
                    {editingRow === index ? (
                      <select
                        value={item.purchaseType}
                        onChange={(e) => handleFieldChange(index, 'purchaseType', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200"
                      >
                        {purchaseTypes.length > 0 ? (
                          <>
                            {console.log('Rendering purchase types:', purchaseTypes)}
                            {purchaseTypes.map((type) => (
                              <option key={type.id} value={type.name} className="py-1">
                                {type.name}
                              </option>
                            ))}
                          </>
                        ) : (
                          <>
                            {console.log('Using fallback options - purchaseTypes length:', purchaseTypes.length)}
                            <option value="Purchase" className="py-1">Purchase</option>
                            <option value="Donation" className="py-1">Donation</option>
                          </>
                        )}
                      </select>
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
                            onClick={() => handleSave(index)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            size="xs"
                            onClick={handleCancel}
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
            </TableBody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewStock;
