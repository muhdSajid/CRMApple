import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import PaginationComponant from "../common/Pagination";
import { get } from "../../service/apiService";
import { apiDomain } from "../../constants/constants";

const FlowbiteUrgencyTable = ({ selectedLocationId, selectedLocation }) => {
  const navigate = useNavigate();
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('criticalStock_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Fetch action items when location changes
  useEffect(() => {
    const fetchActionItems = async () => {
      if (!selectedLocationId) {
        setActionItems([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const url = `${apiDomain}/api/v1/medicine-action-items-details/location/${selectedLocationId}`;
        const response = await get(url);
        setActionItems(response.data || []);
      } catch (err) {
        console.error('Error fetching action items:', err);
        setError(err.message || 'Failed to fetch action items');
        setActionItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActionItems();
  }, [selectedLocationId]);

  // Helper function to get action type styling
  const getActionTypeStyling = (actionType) => {
    // Normalize the actionType to handle case variations
    const normalizedActionType = actionType?.toString().trim();
    
    switch (normalizedActionType) {
      case 'Expired':
        return {
          indicatorColor: "bg-red-700",
          reasonColor: "text-white",
          reasonBgColor: "bg-red-600",
          reason: "Expired",
          textColor: "text-gray-800",
          borderColor: "border-red-600"
        };
      case 'Out of Stock':
        return {
          indicatorColor: "bg-blue-700",
          reasonColor: "text-white",
          reasonBgColor: "bg-blue-600",
          reason: "Out of Stock",
          textColor: "text-gray-800",
          borderColor: "border-blue-600"
        };
      case 'Critically Low':
        return {
          indicatorColor: "bg-orange-500",
          reasonColor: "text-white",
          reasonBgColor: "bg-orange-500",
          reason: "Critically Low",
          textColor: "text-gray-800",
          borderColor: "border-orange-500"
        };
      case 'Near Expiry':
        return {
          indicatorColor: "bg-yellow-500",
          reasonColor: "text-white",
          reasonBgColor: "bg-yellow-500",
          reason: "Near Expiry",
          textColor: "text-gray-800",
          borderColor: "border-yellow-500"
        };
      default:
        return {
          indicatorColor: "bg-gray-500",
          reasonColor: "text-white",
          reasonBgColor: "bg-gray-500",
          reason: actionType || 'Unknown',
          textColor: "text-gray-800",
          borderColor: "border-gray-500"
        };
    }
  };

  // Handle Act Now button click
  const handleActNow = () => {
    if (selectedLocationId && selectedLocation) {
      // Store location data in sessionStorage to maintain context in stock page
      sessionStorage.setItem('selectedLocationId', selectedLocationId.toString());
      sessionStorage.setItem('selectedLocationData', JSON.stringify(selectedLocation));
      
      // Navigate to stock page
      navigate('/stock');
    }
  };

  // Filter action items based on search term
  const filteredActionItems = useMemo(() => {
    return actionItems.filter(item => {
      if (!item) return false;
      
      const medicineNameMatch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const stockDetailsMatch = item.stockCheckDetails?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      // Get styling safely and check reason
      let reasonMatch = false;
      try {
        const styling = getActionTypeStyling(item.actionType || '');
        reasonMatch = styling.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      } catch (error) {
        console.warn('Error getting action type styling for:', item.actionType, error);
      }
      
      return medicineNameMatch || stockDetailsMatch || reasonMatch;
    });
  }, [actionItems, searchTerm]);

  // Calculate pagination
  const { totalItems, totalPages, startIndex, endIndex, paginatedData } = useMemo(() => {
    const totalItems = filteredActionItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredActionItems.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
      paginatedData
    };
  }, [filteredActionItems, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem('criticalStock_itemsPerPage', newItemsPerPage.toString());
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="overflow-x-auto py-4">
      {/* Location requirement message */}
      {!selectedLocationId && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            📍 Please select a location from above to view critical stock and shortages data.
          </p>
        </div>
      )}

      {/* Selected location indicator */}
      {selectedLocationId && selectedLocation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            📍 Showing critical stock data for <span className="font-semibold">{selectedLocation.locationName}</span>
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-600">
            🔄 Loading critical stock data...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            ⚠️ Error loading critical stock data: {error}
          </p>
        </div>
      )}

      {/* Search and pagination controls */}
      {selectedLocationId && !loading && !error && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 border-gray-300 rounded-md w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {filteredActionItems.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows per page:</label>
                  <div className="relative">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="appearance-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Table striped className="[&>tbody>tr:nth-child(odd)]:bg-gray-200">
        <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
            <TableRow>
            <TableHeadCell>Medicine Name</TableHeadCell>
            <TableHeadCell>Stock Details</TableHeadCell>
            <TableHeadCell>Urgency Reason</TableHeadCell>
            <TableHeadCell>Action</TableHeadCell>
            </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">Loading critical stock data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-red-500">Error loading critical stock data</span>
                </div>
              </TableCell>
            </TableRow>
          ) : !selectedLocationId ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">Please select a location to view critical stock data</span>
                </div>
              </TableCell>
            </TableRow>
          ) : actionItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-green-600">✅ No critical stock issues found for this location</span>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredActionItems.length === 0 && searchTerm ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">No items found matching "{searchTerm}"</span>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <span className="text-gray-500">No data available for this page</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item, index) => {
              const styling = getActionTypeStyling(item.actionType);
              return (
                <TableRow key={item.actionItemId || index}>
                  <TableCell className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full ${styling.indicatorColor}`}></span>
                    <span className={styling.textColor}>{item.medicineName}</span>
                  </TableCell>
                  <TableCell className={`text-sm ${styling.textColor}`}>
                    {item.stockCheckDetails}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold px-3 py-1.5 rounded-full text-xs ${styling.reasonColor} ${styling.reasonBgColor} ${styling.borderColor} border shadow-sm`}>
                      {styling.reason}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={handleActNow}
                      className="text-blue-600 hover:underline text-sm hover:text-blue-800 transition-colors font-medium"
                    >
                      Act Now
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationComponant 
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default FlowbiteUrgencyTable;
