import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import FilterPopover from "../common/Filter";
import { get } from "../../service/apiService";
import { apiDomain } from "../../constants/constants";

const PurchaseAnalytics = ({ selectedLocationId, selectedLocation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const svgRef = useRef();
  const wrapperRef = useRef();
  const height = 160;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 }; // Increased left margin for larger labels

  // Generate year options (current year and last 2 years)
  const getYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // Fallback data in case API fails
  const getFallbackData = useCallback(() => [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
    { month: "Jul", value: 0 },
    { month: "Aug", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dec", value: 0 },
  ], []);

  // Transform API response to chart-compatible format
  const transformApiDataToChartData = useCallback((apiData) => {
    // If API returns an array of monthly data
    if (Array.isArray(apiData)) {
      return apiData.map(item => {
        return {
          month: item.month || item.monthName || 'Unknown',
          value: item.value || item.totalValue || item.amount || item.purchase || 0,
          change: item.change || (item.percentageChange ? `${item.percentageChange > 0 ? '+' : ''}${item.percentageChange}%` : undefined)
        };
      });
    }
    
    // If API returns a single object with monthly breakdown
    if (apiData && typeof apiData === 'object') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        month,
        value: apiData[month] || apiData[month.toLowerCase()] || 0,
        change: undefined // Add logic for change calculation if needed
      }));
    }
    
    // Fallback to default data structure
    return getFallbackData();
  }, [getFallbackData]);

  // Fetch data from API
  useEffect(() => {
    const fetchPurchaseAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use selectedLocationId if available, otherwise default to location ID 1
        const locationId = selectedLocationId || 1;
        
        // API endpoint for location analytics monthly with dynamic location ID and year
        const url = `${apiDomain}/api/v1/location-analytics/monthly/${locationId}/${selectedYear}`;
        
        const response = await get(url);
        
        // Transform API data to match the chart format
        const transformedData = transformApiDataToChartData(response.data);
        setData(transformedData);
        
      } catch (err) {
        console.error('Error fetching purchase analytics:', err);
        setError(err.message || 'Failed to fetch purchase analytics');
        // Use fallback data on error
        setData(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseAnalytics();
  }, [selectedLocationId, selectedYear, transformApiDataToChartData, getFallbackData]); // Add all dependencies

  // Chart rendering useEffect
  useEffect(() => {
    // Don't render chart if data is not loaded yet
    if (loading || !data.length) return;
    const svg = d3.select(svgRef.current);

    const renderChart = (width) => {
      svg.selectAll("*").remove();
      
      // Detect dark mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      const textColor = isDarkMode ? '#e5e7eb' : '#374151'; // gray-200 for dark, gray-700 for light
      const bgBarColor = isDarkMode ? '#374151' : '#F3F4F6'; // gray-700 for dark, gray-100 for light

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.month))
        .range([margin.left, width - margin.right + 20])
        .padding(0.3);

      // Calculate the maximum value from the data and add some padding
      const maxValue = d3.max(data, (d) => d.value) || 0;
      const yDomain = maxValue > 0 ? [0, maxValue * 1.1] : [0, 25000]; // Add 10% padding or use default

      const y = d3
        .scaleLinear()
        .domain(yDomain)
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Background bars
      svg
        .selectAll(".bar-bg")
        .data(data)
        .join("rect")
        .attr("class", "bar-bg")
        .attr("x", (d) => x(d.month))
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("fill", bgBarColor)
        .attr("rx", 6)
        .attr("ry", 6);

      // Data bars
      svg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => y(0) - y(d.value))
        .attr("width", x.bandwidth())
        .attr("fill", (d) => (d.value > 0 ? "#2F5A8F" : "#E5E7EB"))
        .attr("rx", 4)
        .on("mousemove", (event, d) => {
          if (d.value > 0) {
            const bounds = wrapperRef.current.getBoundingClientRect();
            setTooltipData({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
              value: d.value,
              change: d.change,
            });
          }
        })
        .on("mouseleave", () => setTooltipData(null));

      // X-axis labels
      svg
        .selectAll(".x-axis-label")
        .data(data)
        .join("text")
        .attr("class", "x-axis-label")
        .attr("x", (d) => x(d.month) + x.bandwidth() / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", textColor)
        .text((d) => d.month);

      // Y-axis labels
      svg
        .selectAll(".y-axis-label")
        .data(y.ticks(5))
        .join("text")
        .attr("class", "y-axis-label")
        .attr("x", margin.left - 10)
        .attr("y", (d) => y(d))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 9)
        .attr("fill", textColor)
        .text((d) => {
          if (d >= 100000) {
            return `₹${(d / 100000).toFixed(1)}L`; // Show in Lakhs
          } else if (d >= 1000) {
            return `₹${(d / 1000).toFixed(0)}k`; // Show in thousands
          } else {
            return `₹${d}`; // Show actual value for small numbers
          }
        });
    };

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      renderChart(width);
    });

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [data, loading, margin.left, margin.right, margin.bottom, margin.top]); // Add all dependencies

  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading purchase analytics...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative p-1 w-full">
      {!selectedLocationId && (
        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            📍 Select a location from above to view specific purchase analytics, or viewing default data
          </p>
        </div>
      )}
      {selectedLocationId && selectedLocation && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📍 Showing purchase analytics for <span className="font-semibold">{selectedLocation.locationName}</span>
          </p>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">₹{total.toLocaleString()}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">spent this year</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          {/* <FilterPopover /> */}
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <svg ref={svgRef} height={height} className="w-full" />

      {tooltipData && (
        <div
          className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 p-2 rounded-md shadow dark:shadow-gray-900 text-sm z-50 pointer-events-none"
          style={{
            top: tooltipData.y + 10,
            left: tooltipData.x + 10,
          }}
        >
          <strong className="text-gray-900 dark:text-gray-100">₹{tooltipData.value.toLocaleString()}</strong>
          {tooltipData.change && (
            <div className="text-green-600 dark:text-green-400 text-xs mt-1">
              📈 {tooltipData.change}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseAnalytics;
