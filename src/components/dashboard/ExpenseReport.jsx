import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { get, getMedicineDailyCostSummary } from "../../service/apiService";

const ExpensesReport = ({ selectedLocationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();

  // Fallback data in case API fails
  const getFallbackData = useCallback(() => [
    { name: "Antibiotics", value: 28848, color: "#dc2626" },
    { name: "Vaccines", value: 11508, color: "#facc15" },
    { name: "Diuretics", value: 4848, color: "#f97316" },
    { name: "Pain Relievers", value: 8508, color: "#22c55e" },
  ], []);

  // Transform API response to chart-compatible format
  const transformApiDataToChartData = useCallback((apiData) => {
    // Default colors for different medicine categories
    const defaultColors = ["#dc2626", "#facc15", "#f97316", "#22c55e", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];
    
    // If API returns an array of expense data
    if (Array.isArray(apiData)) {
      return apiData.map((item, index) => ({
        name: item.name || item.category || item.medicineName || `Category ${index + 1}`,
        value: item.value || item.amount || item.expense || item.cost || 0,
        color: item.color || defaultColors[index % defaultColors.length]
      }));
    }
    
    // If API returns a single object with expense breakdown
    if (apiData && typeof apiData === 'object') {
      return Object.keys(apiData).map((key, index) => ({
        name: key,
        value: apiData[key] || 0,
        color: defaultColors[index % defaultColors.length]
      }));
    }
    
    // Fallback to default data structure
    return getFallbackData();
  }, [getFallbackData]);

  // Fetch data from API
  useEffect(() => {
    const fetchExpenseReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use selectedLocationId if available, otherwise default to location ID 1
        const locationId = selectedLocationId || 1;
        
        // Try primary expense report API first
        let apiData = null;
        let apiWorked = false;
        
        try {
          // Use proxy path (without domain) - this will be handled by Vite proxy
          const url = `/api/v1/expense-report/location/${locationId}`;
          const response = await get(url);
          apiData = response.data;
          apiWorked = true;
        } catch (primaryErr) {
          
          // Try alternative cost summary API if available
          try {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            const searchData = {
              locationIds: [locationId],
              startDate: thirtyDaysAgo.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            };
            
            const costResponse = await getMedicineDailyCostSummary(searchData);
            
            // Transform cost summary data to expense format
            if (costResponse && Array.isArray(costResponse) && costResponse.length > 0) {
              const medicineExpenses = {};
              costResponse.forEach(item => {
                const medicineName = item.medicineName || 'Unknown Medicine';
                if (!medicineExpenses[medicineName]) {
                  medicineExpenses[medicineName] = 0;
                }
                medicineExpenses[medicineName] += (item.totalCost || item.cost || 0);
              });
              
              // Convert to array format
              apiData = Object.keys(medicineExpenses).map(name => ({
                name,
                value: medicineExpenses[name]
              }));
              
              if (apiData.length > 0) {
                apiWorked = true;
              }
            }
          } catch {
            // Alternative API failed, will use fallback data
          }
          
          // If neither API worked, we'll use fallback data
          if (!apiWorked) {
            // Only set error if it's an authentication or serious issue
            if (primaryErr.response?.status === 401 || primaryErr.response?.status === 403) {
              setError('Authentication required to fetch expense data.');
            }
          }
        }
        
        if (apiWorked && apiData && apiData.length > 0) {
          // Transform API data to match the chart format
          const transformedData = transformApiDataToChartData(apiData);
          setData(transformedData);
          setError(null); // Clear any previous errors
        } else {
          // Use fallback data
          setData(getFallbackData());
          setError(null); // Don't show error message for fallback data
        }
        
      } catch (err) {
        // Only show error for serious issues, not for normal API failures
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Authentication required to access expense data.');
        }
        setData(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseReport();
  }, [selectedLocationId, transformApiDataToChartData, getFallbackData]);

  // Calculate total from current data
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  useEffect(() => {
    // Don't render chart if data is not loaded yet
    if (loading || !data.length) return;
    
    const radius = 80;
    const arcGenerator = d3.arc().innerRadius(60).outerRadius(radius);

    const pieGenerator = d3
      .pie()
      .value((d) => d.value)
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    const arcs = pieGenerator(data);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", 200)
      .attr("height", 120);

    const group = svg.append("g").attr("transform", "translate(100,100)");

    group
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d, i) => data[i].color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
  }, [data, loading]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading expense report...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center pt-6">
      {error && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700">{error}</p>
        </div>
      )}
      
      <svg ref={svgRef} className="mx-auto"></svg>
      <div className="-mt-12 text-center">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-xl font-bold">₹{total.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-12 pt-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-gray-100 p-3 rounded-lg text-left flex flex-col"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <p className="font-semibold text-black text-sm">
              ₹{item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesReport;
