import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  TabItem,
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
import { MdEdit } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import FilterPopover from "../common/Filter";
import PaginationComponant from "../common/Pagination";
import ViewStock from "./ViewStock";
import { AddMedicineModal } from "./AddMedicineModal";
import { get } from "../../service/apiService";
import { apiDomain } from "../../constants/constants";

const MedicineStock = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicineData, setMedicineData] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Filter medicine data based on search term
  const filteredMedicineData = medicineData.filter(item =>
    item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.medicineTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.stockStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

        <Tabs variant="default">
          {loading ? (
            <TabItem title="Loading..." />
          ) : error ? (
            <TabItem title="Error loading locations" />
          ) : locations.length > 0 ? (
            locations
              .filter(location => location.isActive)
              .map((location) => (
                <TabItem
                  key={location.id}
                  active={selectedLocationId === location.id}
                  title={location.name}
                  onClick={() => handleTabClick(location.id)}
                />
              ))
          ) : (
            <TabItem title="No locations available" />
          )}
        </Tabs>

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
              <span className="text-sm text-gray-600">
                Showing {filteredMedicineData.length} of {medicineData.length} medicines
              </span>
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
            <FilterPopover />
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
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
              ) : (
                filteredMedicineData.map((item, index) => {
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
                        <button className="flex text-base font-medium">
                          <Tooltip content="Edit Stock">
                            <MdEdit />
                          </Tooltip>
                          <Tooltip content="View Stock">
                            <IoEyeOutline onClick={() => setIsOpen(true)} />
                          </Tooltip>
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationComponant />
      </div>
      {isOpen && <ViewStock isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      {isModalOpen && (
        <AddMedicineModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onMedicineAdded={fetchMedicineData}
          onShowSuccess={handleShowSuccess}
        />
      )}
    </div>
  );
};

export default MedicineStock;
