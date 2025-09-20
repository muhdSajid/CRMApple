import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchDonationReport, reset, clearError } from "../../store/donationSlice";
import { getLast12MonthsOptions, getCurrentMonthYear } from "../../utils/dateUtils";

const DonationReport = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const dispatch = useDispatch();
  const { data, total, isLoading, isError, isSuccess, message } = useSelector((state) => state.donation);

  // Get month options for the last 12 months
  const monthOptions = getLast12MonthsOptions();
  const currentMonthYear = getCurrentMonthYear();

  // Initialize with current month selected
  useEffect(() => {
    if (!hasInitialized) {
      const currentValue = `${currentMonthYear.month}-${currentMonthYear.year}`;
      setSelectedMonthYear(currentValue);
      
      console.log('Fetching donation report data - loading current month data');
      dispatch(fetchDonationReport({
        month: currentMonthYear.month,
        year: currentMonthYear.year
      }));
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized, currentMonthYear.month, currentMonthYear.year]);

  // Handle month/year selection change
  const handleMonthYearChange = (e) => {
    const value = e.target.value;
    setSelectedMonthYear(value);
    
    // Parse month and year from selection
    const [month, year] = value.split('-').map(Number);
    
    console.log('Fetching donation report with params:', { month, year });
    dispatch(fetchDonationReport({ month, year }));
  };

  // Handle error and success states
  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(clearError());
    }

    if (isSuccess && message) {
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch]);

  // Check if we have real data from the API
  const hasRealData = data && data.length > 0;
  const displayData = hasRealData ? data : [];
  const displayTotal = hasRealData ? total : 0;

  console.log('=== DONATION REPORT DEBUG ===');
  console.log('API data:', data);
  console.log('Data length:', data?.length);
  console.log('Total from Redux:', total);
  console.log('Has real data:', hasRealData);
  console.log('Display data:', displayData);
  console.log('Display total:', displayTotal);
  console.log('==============================');

  // Assign colors to API data if they don't have them and ensure amount is a number
  const dataWithColors = displayData.map((city, index) => ({
    ...city,
    amount: Number(city.value || city.amount) || 0, // Handle both 'value' and 'amount' fields
    color: city.color || [
      "bg-red-400",
      "bg-yellow-400", 
      "bg-orange-400",
      "bg-green-400",
      "bg-blue-400",
      "bg-purple-400",
      "bg-pink-400",
      "bg-indigo-400"
    ][index % 8]
  }));

  if (isLoading) {
    return (
      <div className="p-1">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading donation report...</span>
        </div>
      </div>
    );
  }

  // Show empty state when no data is available
  if (!hasRealData) {
    return (
      <div className="p-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold">₹0</h2>
            <p className="text-sm text-gray-500">
              received in {monthOptions.find(opt => opt.value === selectedMonthYear)?.displayName || 'selected period'}
            </p>
          </div>
          <select 
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            value={selectedMonthYear}
            onChange={handleMonthYearChange}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.displayName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl text-gray-300 mb-2">📊</div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">No Donation Data Available</h3>
          <p className="text-sm text-gray-500 text-center">
            There are no donation reports to display for this period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="flex justify-between items-start">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold">₹{displayTotal.toLocaleString()}</h2>
          <p className="text-sm text-gray-500">
            received in {monthOptions.find(opt => opt.value === selectedMonthYear)?.displayName || 'selected period'}
          </p>
        </div>
        <select 
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          value={selectedMonthYear}
          onChange={handleMonthYearChange}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded overflow-hidden my-4">
        {dataWithColors.map((city, idx) => {
          const percentage = displayTotal > 0 ? ((city.amount || 0) / displayTotal) * 100 : 0;
          return (
            <div
              key={idx}
              className={`${city.color}`}
              style={{ width: `${percentage}%` }}
            ></div>
          );
        })}
      </div>

      {/* City cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {dataWithColors.map((city, idx) => (
          <div
            key={idx}
            className="bg-gray-100 px-3 py-2 rounded flex flex-col items-start"
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className={`w-3 h-3 rounded-full ${city.color}`}></span>
              {city.name || 'Unknown Location'}
            </div>
            <div className="font-bold text-md mt-1">
              ₹{(city.amount || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationReport;
