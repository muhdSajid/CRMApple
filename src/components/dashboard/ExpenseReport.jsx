import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const data = [
  { name: "Antibiotics", value: 28848, color: "#dc2626" },
  { name: "Vaccines", value: 11508, color: "#facc15" },
  { name: "Diuretics", value: 4848, color: "#f97316" },
  { name: "Pain Relievers", value: 8508, color: "#22c55e" },
];

const total = data.reduce((acc, cur) => acc + cur.value, 0);

const ExpensesReport = () => {
  const svgRef = useRef();

  useEffect(() => {
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
  }, []);

  return (
    <div className="max-w-md mx-auto text-center">
      <svg ref={svgRef} className="mx-auto"></svg>
      <div className="-mt-12 text-center">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-xl font-bold">₹{total.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
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
