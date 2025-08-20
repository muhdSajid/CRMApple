import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchDonationReport, reset, clearError } from "../../store/donationSlice";

const DonationReport = () => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const dispatch = useDispatch();
  const { data, total, isLoading, isError, isSuccess, message } = useSelector((state) => state.donation);

  // Fetch data on component mount
  useEffect(() => {
    if (!hasInitialized) {
      console.log('Fetching donation report data - first call only');
      dispatch(fetchDonationReport());
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized]);

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

  // Fallback data for when API fails or returns empty data
  const fallbackData = [
    { name: "Bangalore", amount: 28848, color: "bg-red-400" },
    { name: "Mangaluru", amount: 1508, color: "bg-yellow-400" },
    { name: "Udupi", amount: 5848, color: "bg-orange-400" },
    { name: "Hassan", amount: 24644, color: "bg-green-400" },
  ];

  // Use API data if available, otherwise use fallback data
  const displayData = data && data.length > 0 ? data : fallbackData;
  const displayTotal = total > 0 ? total : fallbackData.reduce((sum, city) => sum + (city.amount || 0), 0);

  console.log('=== DONATION REPORT DEBUG ===');
  console.log('API data:', data);
  console.log('Data length:', data?.length);
  console.log('Total from Redux:', total);
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

  return (
    <div className="p-1">
      <div className="flex justify-between items-start">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold">₹{displayTotal.toLocaleString()}</h2>
          <p className="text-sm text-gray-500">received this month</p>
        </div>
        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      {/* Show fallback notice if using fallback data */}
      {(!data || data.length === 0) && !isLoading && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700">
            📊 Using sample data. Real data will be displayed once API returns valid response.
          </p>
        </div>
      )}

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
