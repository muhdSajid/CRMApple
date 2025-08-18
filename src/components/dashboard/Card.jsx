import { Card } from "flowbite-react";
import { HiChartSquareBar } from "react-icons/hi";
import { useState, useEffect } from "react";
import { get } from "../../service/apiService";
import { apiDomain } from "../../constants/constants";

const LocationCard = ({ onLocationSelect, selectedLocationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationStatistics = async () => {
      try {
        setLoading(true);
        const url = `${apiDomain}/api/v1/location-statistics/locations-with-statistics`;
        const response = await get(url);
        
        // The apiService returns the axios response, so we need response.data
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching location statistics:', err);
        setError(err.message || 'Failed to fetch location statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationStatistics();
  }, []);

  // Separate useEffect for handling session storage restoration
  useEffect(() => {
    if (data.length > 0) {
      const savedLocationId = sessionStorage.getItem('selectedLocationId');
      if (savedLocationId && onLocationSelect) {
        const savedLocation = data.find(loc => loc.locationId.toString() === savedLocationId);
        if (savedLocation) {
          onLocationSelect(savedLocation);
        }
      }
    }
  }, [data, onLocationSelect]);

  const handleLocationClick = (location) => {
    // Save selected location to sessionStorage
    sessionStorage.setItem('selectedLocationId', location.locationId.toString());
    sessionStorage.setItem('selectedLocationData', JSON.stringify(location));
    
    // Notify parent component
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading location statistics...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">No location data available</div>
      </div>
    );
  }

  return data.map((item, index) => {
    const isSelected = selectedLocationId === item.locationId;
    
    return (
      <Card 
        key={item.locationId || item.id || index} 
        className={`w-full max-w-xs rounded-2xl shadow-sm p-1 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          isSelected 
            ? 'bg-[#2C5B80] border-2 border-[#1a4a6b] shadow-lg' 
            : 'bg-[#E8EFF2] hover:bg-[#d1dde3] hover:shadow-md'
        }`}
        onClick={() => handleLocationClick(item)}
      >
        <div className={`flex items-center justify-center w-9 h-9 rounded-full mb-1 ${
          isSelected ? 'bg-white' : 'bg-[#2C5B80]'
        }`}>
          <HiChartSquareBar className={`text-xl ${
            isSelected ? 'text-[#2C5B80]' : 'text-white'
          }`} />
        </div>

        <h5 className={`text-base font-semibold mb-1 ${
          isSelected ? 'text-white' : 'text-gray-800'
        }`}>
          {item.locationName}
        </h5>
        
        <div className="space-y-1.5">
          <div className={`flex items-center space-x-2 rounded-md pr-3 py-1 ${
            isSelected ? 'bg-[#1a4a6b]' : 'bg-[#F2F6FF]'
          }`}>
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-blue-700 rounded">
              {item.outOfStockCount || 0}
            </span>
            <span className={`text-sm ${
              isSelected ? 'text-blue-200' : 'text-blue-800'
            }`}>
              Out of Stock
            </span>
          </div>

          <div className={`flex items-center space-x-2 rounded-md pr-3 py-1 ${
            isSelected ? 'bg-[#1a4a6b]' : 'bg-[#FDF4F4]'
          }`}>
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded">
              {item.expiredCount || 0}
            </span>
            <span className={`text-sm ${
              isSelected ? 'text-red-200' : 'text-red-800'
            }`}>
              Expired
            </span>
          </div>

          <div className={`flex items-center space-x-2 rounded-md pr-3 py-1 ${
            isSelected ? 'bg-[#1a4a6b]' : 'bg-[#FFF1E2]'
          }`}>
            <span className="px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded">
              {item.nearExpiryCount || 0}
            </span>
            <span className={`text-sm ${
              isSelected ? 'text-orange-200' : 'text-orange-800'
            }`}>
              Near Expiry
            </span>
          </div>
        </div>
      </Card>
    );
  });
};

export default LocationCard;
