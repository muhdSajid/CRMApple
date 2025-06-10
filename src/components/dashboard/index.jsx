import FilterPopover from "../common/Filter";

const Index = () => {
  return (
    <div className="p-4 space-y-6 bg-[#f9f9f9]">
      {/* Location Specific-Medicine Status */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Location Specific-Medicine Status
          </h2>
          <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        {/* Content goes here */}
      </div>

      {/* Purchase Analytics & Expense Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Purchase Analytics</h2>
            <div className="flex items-center gap-2">
              <FilterPopover />
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>
          {/* Chart goes here */}
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Expense Report</h2>
            <div className="flex items-center gap-2">
              <FilterPopover />
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>
          {/* Donut graph goes here */}
        </div>
      </div>

      {/* Donation Report */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Donation Report</h2>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm cursor-pointer">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        {/* Donation bar goes here */}
      </div>

      {/* Critical Stock & Shortages */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Critical Stock & Shortages</h2>
          <div className="flex items-center gap-2">
            <FilterPopover />
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm cursor-pointer">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
        </div>
        {/* Table goes here */}
      </div>
    </div>
  );
};

export default Index;
