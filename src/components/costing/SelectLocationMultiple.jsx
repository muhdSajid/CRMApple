import React, { useState, useRef, useEffect } from "react";
import { Label } from "flowbite-react";
import { getLocations } from "../../service/apiService";

export const SelectLocationMultiple = ({ costingData, setCostingData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getLocations();
      const activeLocations = (response || []).filter(location => location.isActive);
      setLocations(activeLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (locationId) => {
    setCostingData((prev) => {
      const location = prev.location || [];
      const updatedLocation = location.includes(locationId)
        ? location.filter((id) => id !== locationId)
        : [...location, locationId];

      return { ...prev, location: updatedLocation };
    });
  };

  const getSelectedLocationNames = () => {
    if (!costingData.location || costingData.location.length === 0) {
      return "Select locations";
    }
    
    const selectedNames = costingData.location.map(id => {
      const location = locations.find(loc => loc.id === id);
      return location ? location.name : `Location ${id}`;
    });
    
    return selectedNames.join(", ");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor="location">Location</Label>

      <div
        className="border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${(!costingData.location || costingData.location.length === 0) ? 'text-gray-500' : ''} truncate`}>
          {getSelectedLocationNames()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 animate-spin rounded-full"></div>
                Loading locations...
              </div>
            </div>
          ) : locations.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              No locations available
            </div>
          ) : (
            <>
              {/* Select All / Deselect All */}
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    if (costingData.location && costingData.location.length === locations.length) {
                      // Deselect all
                      setCostingData(prev => ({ ...prev, location: [] }));
                    } else {
                      // Select all
                      setCostingData(prev => ({ ...prev, location: locations.map(loc => loc.id) }));
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {costingData.location && costingData.location.length === locations.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {locations.map((location) => (
                <label
                  key={location.id}
                  className="flex items-start px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={costingData.location && costingData.location.includes(location.id)}
                    onChange={() => toggleLocation(location.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <span className="text-sm text-gray-900 font-medium block">{location.name}</span>
                    {location.locationAddress && (
                      <span className="text-xs text-gray-500 block mt-0.5 truncate">{location.locationAddress}</span>
                    )}
                    {location.contactInfo && (
                      <span className="text-xs text-gray-400 block">{location.contactInfo}</span>
                    )}
                  </div>
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectLocationMultiple;
