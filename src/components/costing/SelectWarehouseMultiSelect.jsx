import React, { useState, useRef, useEffect } from "react";
import { Label } from "flowbite-react";

export const SelectWarehouseMultiSelect = ({ costingData, setCostingData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const warehouses = ["Warehouse 1", "Warehouse 2", "Warehouse 3"];

  const toggleOption = (option) => {
    setCostingData((prev) => {
      const warehouse = prev.warehouse || [];
      const updatedWarehouse = warehouse.includes(option)
        ? warehouse.filter((o) => o !== option)
        : [...warehouse, option];

      return { ...prev, warehouse: updatedWarehouse };
    });
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
      <Label htmlFor="warehouse">Select Warehouse</Label>

      <div
        className="border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {costingData.warehouse.length === 0
          ? "Select options"
          : costingData.warehouse.join(", ")}
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
                checked={costingData.warehouse.includes(warehouse)}
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

export default SelectWarehouseMultiSelect;
