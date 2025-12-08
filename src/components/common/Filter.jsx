import React, { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa6";

const FilterPopover = () => {
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={filterRef}>
      <button
        onClick={() => setShowFilter((prev) => !prev)}
        className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100  flex items-center gap-2"
      >
        <FaFilter className="text-base" />
        <span>Filters</span>
      </button>

      {showFilter && (
        <div className="absolute z-10 right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Filter Options
          </h4>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                End Date
              </label>
              <input
                type="date"
                className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowFilter(false)}
              className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowFilter(false)}
              className="text-sm px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPopover;
