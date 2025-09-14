import { useState, useEffect, useCallback } from "react";
import LocationCard from "./Card";
import FilterPopover from "../common/Filter";
import CriticalStock from "./CriticalStock";
import DonationReport from "./DonationReport";
import ExpensesReport from "./ExpenseReport";
import PurchaseAnalytics from "./PurchaseAnalytics";
import PageWrapper from "../common/PageWrapper";

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Component mounting effect
  useEffect(() => {
    setIsComponentMounted(true);
    return () => setIsComponentMounted(false);
  }, []);

  // Track initial load completion
  useEffect(() => {
    if (isComponentMounted) {
      setInitialLoadComplete(true);
    }
  }, [isComponentMounted]);

  // Load selected location from sessionStorage on component mount
  useEffect(() => {
    const savedLocationId = sessionStorage.getItem('selectedLocationId');
    const savedLocationData = sessionStorage.getItem('selectedLocationData');
    
    if (savedLocationId && savedLocationData) {
      try {
        const locationData = JSON.parse(savedLocationData);
        setSelectedLocationId(parseInt(savedLocationId));
        setSelectedLocation(locationData);
      } catch (error) {
        console.error('Error parsing saved location data:', error);
        // Clear invalid data
        sessionStorage.removeItem('selectedLocationId');
        sessionStorage.removeItem('selectedLocationData');
      }
    }
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
    setSelectedLocationId(location.locationId);
  }, []);
  
  return (
    <PageWrapper isLoading={!initialLoadComplete}>
      <div className="page-container p-4 space-y-6 bg-[#f9f9f9] fade-in">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 mb-4">
            <h3 className="text-xl font-semibold">
              Location Specific-Medicine Status
            </h3>
            {selectedLocation && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Selected: <span className="font-semibold text-blue-700">{selectedLocation.locationName}</span>
                <button 
                  onClick={() => {
                    setSelectedLocation(null);
                    setSelectedLocationId(null);
                    sessionStorage.removeItem('selectedLocationId');
                    sessionStorage.removeItem('selectedLocationData');
                  }}
                  className="ml-2 text-blue-700 hover:text-blue-900"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <LocationCard 
            onLocationSelect={handleLocationSelect}
            selectedLocationId={selectedLocationId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="border-b-2 border-gray-200 pb-2 mb-2">
              <h3 className="text-xl font-semibold">Purchase Analytics</h3>
            </div>
            <PurchaseAnalytics 
              selectedLocationId={selectedLocationId} 
              selectedLocation={selectedLocation} 
            />
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <div className="border-b-2 border-gray-200 pb-2 mb-2">
              <h3 className="text-xl font-semibold">Donation Report</h3>
            </div>
            <DonationReport />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="border-b-2 border-gray-200 pb-2 mb-4">
            <h3 className="text-xl font-semibold">Expense Report</h3>
          </div>

          {!selectedLocationId && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                📍 Select a location from above to view specific expense report, or viewing default data
              </p>
            </div>
          )}
          {selectedLocationId && selectedLocation && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                📍 Showing expense report for <span className="font-semibold">{selectedLocation.locationName}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mb-4">
            {/* <FilterPopover /> */}
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          <ExpensesReport 
            selectedLocationId={selectedLocationId} 
            selectedLocation={selectedLocation} 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="border-b-2 border-gray-200 pb-2 mb-2">
          <h2 className="text-xl font-semibold">Critical Stock & Shortages</h2>
        </div>

        <CriticalStock 
          selectedLocationId={selectedLocationId}
          selectedLocation={selectedLocation}
        />
      </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
