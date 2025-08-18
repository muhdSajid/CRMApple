import { Card } from "flowbite-react";
import { HiChartSquareBar } from "react-icons/hi";

const LocationCard = () => {
  const data = [
    {
      location: "Bangalore",
      icon: "chart",
      outOfStock: 11,
      expired: 12,
      nearExpiry: 7
    },
    {
      location: "Mangaluru",
      icon: "chart",
      outOfStock: 3,
      expired: 28,
      nearExpiry: 1
    },
    {
      location: "Udupi",
      icon: "chart",
      outOfStock: 83,
      expired: 14,
      nearExpiry: 4
    },
    {
      location: "Hassan",
      icon: "chart",
      outOfStock: 21,
      expired: 51,
      nearExpiry: 7
    },
  ];

  return data.map((item) => (
    <Card className="w-full max-w-xs bg-[#E8EFF2] rounded-2xl shadow-sm p-1">
      <div className="flex items-center justify-center w-9 h-9 bg-[#2C5B80] rounded-full mb-1">
        <HiChartSquareBar className="text-xl text-white" />
      </div>

      <h5 className="text-base font-semibold text-gray-800 mb-1">{item.location}</h5>
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2 bg-[#F2F6FF] rounded-md pr-3 py-1">
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-blue-700 rounded">
            {item.outOfStock}
          </span>
          <span className="text-sm text-blue-800">Out of Stock</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#FDF4F4] rounded-md pr-3 py-1">
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded">
            {item.expired}
          </span>
          <span className="text-sm text-red-800">Expired</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#FFF1E2] rounded-md pr-3 py-1">
          <span className="px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded">
            {item.nearExpiry}
          </span>
          <span className="text-sm text-orange-800">Near Expiry</span>
        </div>
      </div>
    </Card>
  ));
};

export default LocationCard;
