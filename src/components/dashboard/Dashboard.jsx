import FilterPopover from "../common/Filter";

const Dashboard = () => {
  return (
    <div className="p-4 space-y-6 bg-[#f9f9f9]">
      {/* Location Specific-Medicine Status */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 mb-4">
          <h3 className="text-xl font-semibold">
            Location Specific-Medicine Status
          </h3>
          <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        {/* Content goes here */}
      </div>

      {/* Purchase Analytics & Expense Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="border-b-2 border-gray-200 pb-2 mb-2">
              <h3 className="text-xl font-semibold">Purchase Analytics</h3>
            </div>
            <div className="flex justify-end gap-2 mb-4">
              <FilterPopover />
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            {/* Chart placeholder */}
          </div>

          {/* Donation Report */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="border-b-2 border-gray-200 pb-2 mb-2">
              <h3 className="text-xl font-semibold">Donation Report</h3>
            </div>

            <div className="flex justify-end mb-4">
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>

            {/* Donation bar chart placeholder */}
          </div>
        </div>

        {/* Right Column: Expense Report (Independent) */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2 mb-4">
            <h3 className="text-xl font-semibold">Expense Report</h3>
            <div className="flex items-center gap-2">
              <FilterPopover />
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>
          {/* Donut chart placeholder */}
        </div>
      </div>

      {/* Critical Stock & Shortages */}
      <div className="bg-white rounded-2xl shadow p-4">
        {/* Heading with underline */}
        <div className="border-b-2 border-gray-200 pb-2 mb-2">
          <h2 className="text-xl font-semibold">Critical Stock & Shortages</h2>
        </div>

        {/* Filters below underline, right aligned */}
        <div className="flex justify-end gap-2 mb-4">
          <FilterPopover />
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm cursor-pointer">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        {/* Table goes here */}
      </div>
    </div>
  );
};

export default Dashboard;
