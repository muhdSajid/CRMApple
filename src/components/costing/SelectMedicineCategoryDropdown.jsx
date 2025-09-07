import React, { useState, useRef, useEffect } from "react";
import { Label } from "flowbite-react";
import { getMedicineTypes } from "../../service/apiService";

export const SelectMedicineCategoryDropdown = ({ costingData, setCostingData }) => {
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch medicine types when component mounts
  useEffect(() => {
    fetchMedicineTypes();
  }, []);

  const fetchMedicineTypes = async () => {
    try {
      setLoading(true);
      const types = await getMedicineTypes();
      setMedicineTypes(types || []);
    } catch (error) {
      console.error('Error fetching medicine types:', error);
      // Fallback to hardcoded types if API fails
      setMedicineTypes([
        { id: 1, typeName: "Tablet" },
        { id: 2, typeName: "Syrup" },
        { id: 3, typeName: "Injection" },
        { id: 4, typeName: "Capsule" },
        { id: 5, typeName: "Ointment" },
        { id: 6, typeName: "Other" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setCostingData((prev) => {
      const category = prev.category || [];
      const updatedCategory = category.includes(categoryId)
        ? category.filter((id) => id !== categoryId)
        : [...category, categoryId];

      return { ...prev, category: updatedCategory };
    });
  };

  const getSelectedCategoryNames = () => {
    if (!costingData.category || costingData.category.length === 0) {
      return "Select categories";
    }
    
    const selectedNames = costingData.category.map(id => {
      const type = medicineTypes.find(type => type.id === id);
      return type ? type.typeName : `Category ${id}`;
    });
    
    return selectedNames.join(", ");
  };

  // Handle click outside to close dropdown
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
      <Label htmlFor="medicine-category">Medicine Category</Label>

      <div
        className="border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${(!costingData.category || costingData.category.length === 0) ? 'text-gray-500' : ''} truncate`}>
          {getSelectedCategoryNames()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 animate-spin rounded-full"></div>
                Loading categories...
              </div>
            </div>
          ) : medicineTypes.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              No categories available
            </div>
          ) : (
            <>
              {/* Select All / Deselect All */}
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    if (costingData.category && costingData.category.length === medicineTypes.length) {
                      // Deselect all
                      setCostingData(prev => ({ ...prev, category: [] }));
                    } else {
                      // Select all
                      setCostingData(prev => ({ ...prev, category: medicineTypes.map(type => type.id) }));
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {costingData.category && costingData.category.length === medicineTypes.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {medicineTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={costingData.category && costingData.category.includes(type.id)}
                    onChange={() => toggleCategory(type.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className="ml-3 text-sm text-gray-900">{type.typeName}</span>
                </label>
              ))}
            </>
          )}
        </div>
      )}

      {/* Loading indicator outside dropdown */}
      {loading && !isOpen && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 animate-spin rounded-full"></div>
          <span className="text-xs text-gray-500">Loading medicine categories...</span>
        </div>
      )}
      
      {!loading && medicineTypes.length === 0 && (
        <p className="text-xs text-red-500 mt-1">
          Unable to load medicine categories. Please try refreshing the page.
        </p>
      )}
    </div>
  );
};

export default SelectMedicineCategoryDropdown;
