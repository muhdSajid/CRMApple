import React, { useState, useRef, useEffect } from "react";

export const MultiSelectDropdown = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const warehouses = ["Warehouse 1", "Warehouse 2", "Warehouse 3"];

  const toggleOption = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="warehouse"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        Select Warehouse
      </label>

      <div
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOptions.length === 0
          ? "Select options"
          : selectedOptions.join(", ")}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {warehouses.map((warehouse) => (
            <label
              key={warehouse}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(warehouse)}
                onChange={() => toggleOption(warehouse)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{warehouse}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
