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
  const svgRef = useRef();
  const wrapperRef = useRef();
  const height = 160;
  const margin = { top: 10, right: 10, bottom: 30, left: 50 }; // Increased left margin for larger labels

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
        
        // API endpoint for location analytics monthly with dynamic location ID
        const url = `${apiDomain}/api/v1/location-analytics/monthly/${locationId}`;
        
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
  }, [selectedLocationId, transformApiDataToChartData, getFallbackData]); // Add all dependencies

  // Chart rendering useEffect
  useEffect(() => {
    // Don't render chart if data is not loaded yet
    if (loading || !data.length) return;
    const svg = d3.select(svgRef.current);

    const renderChart = (width) => {
      svg.selectAll("*").remove();

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
        .attr("fill", "#F3F4F6")
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
        <div className="text-gray-600">Loading purchase analytics...</div>
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

  return (
    <div ref={wrapperRef} className="relative p-1 w-full">
      {!selectedLocationId && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            📍 Select a location from above to view specific purchase analytics, or viewing default data
          </p>
        </div>
      )}
      {selectedLocationId && selectedLocation && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            📍 Showing purchase analytics for <span className="font-semibold">{selectedLocation.locationName}</span>
          </p>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold">₹{total.toLocaleString()}</h2>
          <p className="text-sm text-gray-500">spent this year</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <FilterPopover />
          <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
      </div>

      <svg ref={svgRef} height={height} className="w-full" />

      {tooltipData && (
        <div
          className="absolute bg-white border p-2 rounded-md shadow text-sm z-50 pointer-events-none"
          style={{
            top: tooltipData.y + 10,
            left: tooltipData.x + 10,
          }}
        >
          <strong>₹{tooltipData.value.toLocaleString()}</strong>
          {tooltipData.change && (
            <div className="text-green-600 text-xs mt-1">
              📈 {tooltipData.change}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseAnalytics;
