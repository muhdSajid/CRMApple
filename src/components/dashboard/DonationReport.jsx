import React from "react";

const DonationReport = () => {
  const data = [
    { name: "Bangalore", amount: 28848, color: "bg-red-400" },
    { name: "Mangaluru", amount: 1508, color: "bg-yellow-400" },
    { name: "Udupi", amount: 5848, color: "bg-orange-400" },
    { name: "Hassan", amount: 24644, color: "bg-green-400" },
  ];

  const total = data.reduce((sum, city) => sum + city.amount, 0);

  return (
    <div className="p-2">
      <div className="flex justify-between items-start">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold">₹{total.toLocaleString()}</h2>
          <p className="text-sm text-gray-500">received this month</p>
        </div>
        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded overflow-hidden my-4">
        {data.map((city, idx) => (
          <div
            key={idx}
            className={`${city.color}`}
            style={{ width: `${(city.amount / total) * 100}%` }}
          ></div>
        ))}
      </div>

      {/* City cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {data.map((city, idx) => (
          <div
            key={idx}
            className="bg-gray-100 px-3 py-2 rounded flex flex-col items-start"
          >
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className={`w-3 h-3 rounded-full ${city.color}`}></span>
              {city.name}
            </div>
            <div className="font-bold text-lg mt-1">
              ₹{city.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationReport;
