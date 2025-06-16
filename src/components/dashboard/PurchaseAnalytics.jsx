import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import FilterPopover from "../common/Filter";

const data = [
  { month: "Jan", value: 15000 },
  { month: "Feb", value: 20000 },
  { month: "Mar", value: 18000 },
  { month: "Apr", value: 14000 },
  { month: "May", value: 18848, change: "+8%" },
  { month: "June", value: 0 },
  { month: "July", value: 0 },
  { month: "Aug", value: 0 },
  { month: "Sep", value: 0 },
  { month: "Oct", value: 0 },
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
];

const PurchaseAnalytics = () => {
  const [tooltipData, setTooltipData] = useState(null);
  const svgRef = useRef();
  const wrapperRef = useRef();
  const height = 160;
  const margin = { top: 10, right: 10, bottom: 30, left: 35 };

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const renderChart = (width) => {
      svg.selectAll("*").remove();

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.month))
        .range([margin.left, width - margin.right + 20])
        .padding(0.3);

      const y = d3
        .scaleLinear()
        .domain([0, 25000])
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
        .text((d) => `₹${d / 1000}k`);
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
  }, []);

  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div ref={wrapperRef} className="relative p-1 w-full">
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
