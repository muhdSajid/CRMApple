import { Button } from "flowbite-react";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

export const Costing = () => {
  return (
    <div className="mt-10">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Cost Report Generator
        </h2>

        <form className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <p className="flex items-center font-medium text-gray-700">
              Generate Report for
            </p>
            <div className="flex items-center">
              <input
                type="radio"
                id="this-month"
                name="report-period"
                value="this-month"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="this-month" className="ml-2 text-sm text-gray-700">
                This Month
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="last-month"
                name="report-period"
                value="last-month"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="last-month" className="ml-2 text-sm text-gray-700">
                Last Month
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="last-3-months"
                name="report-period"
                value="last-3-months"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="last-3-months" className="ml-2 text-sm text-gray-700">
                Last 3 Months
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="this-year"
                name="report-period"
                value="this-year"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="this-year" className="ml-2 text-sm text-gray-700">
                This Year
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="custom-date"
                name="report-period"
                value="custom-date"
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="custom-date" className="ml-2 text-sm text-gray-700">
                Select from date picker
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="purchase-date"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Date of Purchase/ Donation
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="purchase-date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                />
              </div>
            </div>

            <MultiSelectDropdown />

            <div>
              <label
                for="medicine-category"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Medicine Category
              </label>
              <select
                id="medicine-category"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              >
                <option>Antibiotics</option>
                <option>Analgesics</option>
                <option>Antifungals</option>
              </select>
            </div>

            <div>
              <label
                for="export-as"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Export as
              </label>
              <select
                id="export-as"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              >
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Generate Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
