import { useState, useEffect, useCallback } from "react";
import LocationCard from "./Card";
import FilterPopover from "../common/Filter";
import CriticalStock from "./CriticalStock";
import DonationReport from "./DonationReport";
import ExpensesReport from "./ExpenseReport";
import PurchaseAnalytics from "./PurchaseAnalytics";
import PrivilegeGuard from "../common/PrivilegeGuard";
import PageWrapper from "../common/PageWrapper";
import { PRIVILEGES } from "../../constants/constants";

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
      <PrivilegeGuard privileges={[PRIVILEGES.DASHBOARD_VIEW, PRIVILEGES.DASHBOARD_ALL, PRIVILEGES.ALL]}>
        <div className="page-container p-4 space-y-6 bg-[#f9f9f9] dark:bg-gray-900 fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-900 p-6">
            <div className="flex items-center justify-between border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Location Specific-Medicine Status
              </h3>
              {selectedLocation && (
                <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                  Selected: <span className="font-semibold text-blue-700 dark:text-blue-400">{selectedLocation.locationName}</span>
                  <button 
                    onClick={() => {
                      setSelectedLocation(null);
                      setSelectedLocationId(null);
                      sessionStorage.removeItem('selectedLocationId');
                      sessionStorage.removeItem('selectedLocationData');
                    }}
                    className="ml-2 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-900 p-4">
              <div className="border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Purchase Analytics</h3>
              </div>
              <PurchaseAnalytics 
                selectedLocationId={selectedLocationId} 
                selectedLocation={selectedLocation} 
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-900 p-4">
              <div className="border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Donation Report</h3>
              </div>
              <DonationReport />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-900 p-4">
            <div className="border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Expense Report</h3>
            </div>

            {!selectedLocationId && (
              <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  📍 Select a location from above to view specific expense report, or viewing default data
                </p>
              </div>
            )}
            {selectedLocationId && selectedLocation && (
              <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  📍 Showing expense report for <span className="font-semibold">{selectedLocation.locationName}</span>
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mb-4">
              {/* <FilterPopover /> */}
              <div className="relative">
                <select 
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <ExpensesReport 
              selectedLocationId={selectedLocationId} 
              selectedLocation={selectedLocation} 
              selectedYear={selectedYear}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-900 p-4">
          <div className="border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Critical Stock & Shortages</h2>
          </div>

          <CriticalStock 
            selectedLocationId={selectedLocationId}
            selectedLocation={selectedLocation}
          />
        </div>
        </div>
      </PrivilegeGuard>
    </PageWrapper>
  );
};

export default Dashboard;
