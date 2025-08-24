import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Tooltip,
} from "flowbite-react";
import { FaPlus } from "react-icons/fa6";
import { MdEdit, MdFilterList, MdInventory } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { HiViewList } from "react-icons/hi";
import PaginationComponant from "../common/Pagination";
import ViewStock from "./ViewStock";
import { AddMedicineModal } from "./AddMedicineModal";
import { get } from "../../service/apiService";
import { apiDomain } from "../../constants/constants";
import PageWrapper from "../common/PageWrapper";

const MedicineStock = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicineData, setMedicineData] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [medicineTypeFilter, setMedicineTypeFilter] = useState("");
  const [tempStockStatusFilter, setTempStockStatusFilter] = useState("");
  const [tempMedicineTypeFilter, setTempMedicineTypeFilter] = useState("");
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('medicineStock_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const filterButtonRef = useRef(null);
  const filterPopoverRef = useRef(null);

  // Component mounting effect
  useEffect(() => {
    setIsComponentMounted(true);
    return () => setIsComponentMounted(false);
  }, []);

  // Track initial load completion
  useEffect(() => {
    if (!loading && !medicineLoading && locations.length > 0 && isComponentMounted) {
      setInitialLoadComplete(true);
    }
  }, [loading, medicineLoading, locations.length, isComponentMounted]);

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const url = `${apiDomain}/api/v1/locations`;
        const response = await get(url);
        setLocations(response.data);
        
        // Set first active location as default
        const activeLocations = response.data.filter(loc => loc.isActive);
        if (activeLocations.length > 0) {
          setSelectedLocationId(activeLocations[0].id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err.message || 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Fetch medicine data when location changes
  const fetchMedicineData = useCallback(async () => {
    if (!selectedLocationId) return;

    try {
      setMedicineLoading(true);
      const url = `${apiDomain}/api/v1/medicine-list/location/${selectedLocationId}`;
      const response = await get(url);
      setMedicineData(response.data);
      setMedicineError(null);
    } catch (err) {
      console.error('Error fetching medicine data:', err);
      setMedicineError(err.message || 'Failed to fetch medicine data');
    } finally {
      setMedicineLoading(false);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    fetchMedicineData();
  }, [fetchMedicineData]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilterPopover(false);
        // Reset temporary filters when closing without applying
        setTempStockStatusFilter(stockStatusFilter);
        setTempMedicineTypeFilter(medicineTypeFilter);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stockStatusFilter, medicineTypeFilter]);

  // Initialize temp filters when opening popover
  useEffect(() => {
    if (showFilterPopover) {
      setTempStockStatusFilter(stockStatusFilter);
      setTempMedicineTypeFilter(medicineTypeFilter);
    }
  }, [showFilterPopover, stockStatusFilter, medicineTypeFilter]);

  // Update selected location display when selectedLocationId changes
  useEffect(() => {
    // This effect will trigger a re-render when selectedLocationId changes
    // ensuring the "Selected:" display updates immediately
  }, [selectedLocationId]);

  const handleTabClick = (locationId) => {
    setSelectedLocationId(locationId);
  };

  const handleShowSuccess = () => {
    setShowSuccess(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleApplyFilters = () => {
    setStockStatusFilter(tempStockStatusFilter);
    setMedicineTypeFilter(tempMedicineTypeFilter);
    setShowFilterPopover(false);
  };

  const handleClearFilters = () => {
    setTempStockStatusFilter("");
    setTempMedicineTypeFilter("");
    setStockStatusFilter("");
    setMedicineTypeFilter("");
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    localStorage.setItem('medicineStock_itemsPerPage', newItemsPerPage.toString());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Helper function to get stock status styling
  const getStockStatusStyling = (stockStatus) => {
    switch (stockStatus) {
      case 'Out of Stock':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100'
        };
      case 'In Stock':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100'
        };
      case 'Low Stock':
        return {
          color: 'text-orange-600',
          bg: 'bg-orange-100'
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-100'
        };
    }
  };

  // Filter medicine data based on search term, stock status, and medicine type with memoization
  const filteredMedicineData = useMemo(() => {
    return medicineData.filter(item => {
      const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.medicineTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stockStatus.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStockStatus = stockStatusFilter === "" || 
        (stockStatusFilter === "out-of-stock" && item.stockStatus === "Out of Stock") ||
        (stockStatusFilter === "in-stock" && item.stockStatus === "In Stock") ||
        (stockStatusFilter === "low-stock" && item.stockStatus === "Low Stock");
      
      const matchesMedicineType = medicineTypeFilter === "" || 
        item.medicineTypeName.toLowerCase().includes(medicineTypeFilter.toLowerCase());
      
      return matchesSearch && matchesStockStatus && matchesMedicineType;
    });
  }, [medicineData, searchTerm, stockStatusFilter, medicineTypeFilter]);

  // Get unique medicine types for filter dropdown with memoization
  const uniqueMedicineTypes = useMemo(() => {
    return [...new Set(medicineData.map(item => item.medicineTypeName))].filter(Boolean);
  }, [medicineData]);
  
  // Calculate pagination with memoization
  const { totalItems, totalPages, startIndex, endIndex, paginatedData } = useMemo(() => {
    const totalItems = filteredMedicineData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredMedicineData.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
      paginatedData
    };
  }, [filteredMedicineData, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [stockStatusFilter, medicineTypeFilter, searchTerm]);
  return (
    <PageWrapper isLoading={!initialLoadComplete}>
      <div className="page-container p-6 bg-gray-50 min-h-screen fade-in">
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Medicine Stock List</h2>
            {selectedLocationId && locations.length > 0 && !loading && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Selected: <span className="font-semibold text-blue-700">
                  {locations.find(loc => loc.id === selectedLocationId)?.name || 'Unknown Location'}
                </span>
              </div>
            )}
          </div>

        {/* Custom Tab Implementation for better styling */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {loading ? (
              <span className="border-transparent text-gray-500 py-2 px-1 border-b-2 font-medium text-sm">
                Loading...
              </span>
            ) : error ? (
              <span className="border-transparent text-red-500 py-2 px-1 border-b-2 font-medium text-sm">
                Error loading locations
              </span>
            ) : locations.length > 0 ? (
              locations
                .filter(location => location.isActive)
                .map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleTabClick(location.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      selectedLocationId === location.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-md px-3'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {location.name}
                  </button>
                ))
            ) : (
              <span className="border-transparent text-gray-500 py-2 px-1 border-b-2 font-medium text-sm">
                No locations available
              </span>
            )}
          </nav>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              ⚠️ Error loading locations: {error}
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              🔄 Loading locations...
            </p>
          </div>
        )}

        {medicineLoading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              🔄 Loading medicine data...
            </p>
          </div>
        )}

        {medicineError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              ⚠️ Error loading medicine data: {medicineError}
            </p>
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Medicine added successfully!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    The medicine has been added to the inventory and the table has been updated.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 border-gray-300 rounded-md w-64 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
            />
            {!medicineLoading && !medicineError && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} medicines
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              color="blue"
              size="sm"
              className="text-xs px-2 py-1 h-8 bg-sky-800 hover:bg-sky-900"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus className="mr-2" /> Add Medicine
            </Button>
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <MdFilterList className="text-base" />
                Filters
                {(stockStatusFilter || medicineTypeFilter) && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                    {[stockStatusFilter, medicineTypeFilter].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Filter Popover */}
              {showFilterPopover && (
                <div 
                  ref={filterPopoverRef}
                  className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-xl z-50 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Filter Options</h3>
                    <button
                      onClick={() => setShowFilterPopover(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Stock Status
                      </label>
                      <select 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        value={tempStockStatusFilter}
                        onChange={(e) => setTempStockStatusFilter(e.target.value)}
                      >
                        <option value="">All Stock Status</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                        <option value="low-stock">Low Stock</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Medicine Type
                      </label>
                      <select 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        value={tempMedicineTypeFilter}
                        onChange={(e) => setTempMedicineTypeFilter(e.target.value)}
                      >
                        <option value="">All Medicine Types</option>
                        {uniqueMedicineTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                      >
                        Clear all filters
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <Table
            striped
            className="min-w-[1200px] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
          >
            <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
              <TableRow>
                <TableHeadCell>Medicine Name</TableHeadCell>
                <TableHeadCell>Medicine ID</TableHeadCell>
                <TableHeadCell>Medicine Type</TableHeadCell>
                <TableHeadCell>No of Batches</TableHeadCell>
                <TableHeadCell>Updated By</TableHeadCell>
                <TableHeadCell>Updated Date</TableHeadCell>
                <TableHeadCell>Stock Status</TableHeadCell>
                <TableHeadCell>Expiry Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {medicineLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500">Loading medicine data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : medicineError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-red-500">Error loading medicine data</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredMedicineData.length === 0 && searchTerm ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500">No medicines found matching "{searchTerm}"</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : medicineData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500">No medicine data available for this location</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500">No data available for this page</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const stockStyling = getStockStatusStyling(item.stockStatus);
                  return (
                    <TableRow key={`${item.medicineId}-${index}`}>
                      <TableCell>{item.medicineName}</TableCell>
                      <TableCell>{item.medicineId}</TableCell>
                      <TableCell>{item.medicineTypeName}</TableCell>
                      <TableCell>{item.numberOfBatches}</TableCell>
                      <TableCell>{item.updatedByFullName || '-'}</TableCell>
                      <TableCell>
                        {item.updatedAt 
                          ? new Date(item.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`${stockStyling.color} text-sm`}>
                            {item.stockStatus}
                          </span>
                          {item.totalNumberOfMedicines > 0 && (
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                              Total: {item.totalNumberOfMedicines}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.hasExpiredBatches && item.numberOfMedExpired > 0 && (
                          <span className="bg-red-200 text-xs px-2 py-1 rounded-full">
                            {item.numberOfMedExpired} Expired
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Temporarily commented out - no functionality attached yet
                          <Tooltip content="Manage Batches">
                            <button className="group relative flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-200">
                              <MdInventory className="text-lg" />
                            </button>
                          </Tooltip>
                          */}
                          <Tooltip content="View All Batches">
                            <button 
                              onClick={() => {
                                console.log('Setting selectedMedicineId to:', item.medicineAId);
                                console.log('Current item data:', item);
                                // Set medicine ID and open modal directly
                                setSelectedMedicineId(item.medicineId);
                                setIsOpen(true);
                              }} 
                              className="group relative flex items-center justify-center w-8 h-8 text-green-600 hover:text-white bg-green-50 hover:bg-green-600 border border-green-200 hover:border-green-600 rounded-lg transition-all duration-200"
                            >
                              <HiViewList className="text-lg" />
                            </button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationComponant 
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        
        {isOpen && (
          <>
            {console.log('Rendering ViewStock with selectedMedicineId:', selectedMedicineId)}
            <ViewStock 
              isOpen={isOpen} 
              onClose={() => {
                console.log('Closing ViewStock modal');
                setIsOpen(false);
                setSelectedMedicineId(null);
              }} 
              selectedMedicineId={selectedMedicineId}
            />
          </>
        )}
        {isModalOpen && (
          <AddMedicineModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onMedicineAdded={fetchMedicineData}
            onShowSuccess={handleShowSuccess}
          />
        )}
      </div>
      </div>
    </PageWrapper>
  );
};

export default MedicineStock;
