import { Card } from "flowbite-react";

export const LocationCard = () => {
  return (
    <Card className="w-max max-w-xs  pl-4 pr-8 bg-[#E8EFF2] rounded-2xl shadow-sm">
      <div className="flex items-center justify-center w-10 h-10 bg-[#2C5B80] rounded-full mb-4">
        <svg
          className="w-5 h-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 13h4v-2H3v2zm0 4h4v-2H3v2zm0-8h4V7H3v2zm6 4h12v-2H9v2zm0 4h12v-2H9v2zm0-8h12V7H9v2z" />
        </svg>
      </div>

      <h5 className="text-lg font-semibold text-gray-800 mb-3">Bangalore</h5>

      <div className="space-y-2 ">
        <div className="flex items-center space-x-2 bg-[#F2F6FF]  rounded-md pr-4 ">
          <span className="p-1 text-xs font-bold text-white bg-blue-700 rounded">
            11
          </span>
          <span className="text-sm text-blue-800 ">Out of Stock</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#FDF4F4]  rounded-md pr-4">
          <span className="p-1 py-1 text-xs font-bold text-white bg-red-600 rounded">
            12
          </span>
          <span className="text-sm text-red-800">Expired</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#FFF1E2]  rounded-md pr-4">
          <span className="p-1 py-1 text-xs font-bold text-white bg-orange-500 rounded">
            07
          </span>
          <span className="text-sm text-orange-800">Near Expiry</span>
        </div>
      </div>
    </Card>
  );
};
