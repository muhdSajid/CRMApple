import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  Label,
  Datepicker,
} from "flowbite-react";
import { validateAddMedicine } from "../../utils/validate";
import { getMedicineTypes } from "../../service/apiService";

export const AddMedicineModal = ({ open, onClose }) => {
  const [medicineData, setMedicineData] = useState({
    modeOfMedicine: "purchased",
    medicineName: "",
    medicineType: "Tablet",
    lowStockWarning: 0,
  });
  const [errors, setErrors] = useState({
    medicineName: "",
  });
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Fetch medicine types when component mounts
  useEffect(() => {
    const fetchMedicineTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getMedicineTypes();
        setMedicineTypes(types);
        // Set first type as default if available
        if (types && types.length > 0) {
          setMedicineData(prev => ({
            ...prev,
            medicineType: types[0].typeName
          }));
        }
      } catch (error) {
        console.error('Failed to fetch medicine types:', error);
        // Fallback to hardcoded types if API fails
        setMedicineTypes([
          { id: 1, typeName: "Tablet", description: "Tablet form medicine" },
          { id: 2, typeName: "Syrup", description: "Liquid form medicine" },
          { id: 3, typeName: "Other", description: "Other forms of medicine" }
        ]);
      } finally {
        setLoadingTypes(false);
      }
    };

    if (open) {
      fetchMedicineTypes();
    }
  }, [open]);
  const handleChange = (e) => {
    if (e.target.type == "radio") {
      setMedicineData({ ...medicineData, [e.target.name]: e.target.id });
    } else {
      setMedicineData({ ...medicineData, [e.target.id]: e.target.value });
    }
  };
  const handleSubmit = () => {
    const validationErrors = validateAddMedicine(medicineData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log("medicineData", medicineData);
      // proceed with API call
    }
  };
  return (
    <Modal show={open} onClose={onClose} size="4xl">
      <ModalHeader>Add Medicine</ModalHeader>
      <ModalBody>
        <form className="grid grid-cols-2 gap-6 mx-5 mt-3">
          <div>
            <Label>Medicine Name</Label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              onChange={handleChange}
              id="medicineName"
              value={medicineData.medicineName}
              placeholder="Enter medicine name"
            />
            {errors.medicineName && (
              <p className="text-red-500 text-xs mt-1">{errors.medicineName}</p>
            )}
          </div>

          <div>
            <Label>Medicine Type</Label>
            <select
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="medicineType"
              onChange={handleChange}
              value={medicineData.medicineType}
              disabled={loadingTypes}
            >
              {loadingTypes ? (
                <option>Loading...</option>
              ) : (
                medicineTypes.map((type) => (
                  <option key={type.id} value={type.typeName}>
                    {type.typeName}
                  </option>
                ))
              )}
            </select>
            {loadingTypes && (
              <p className="text-gray-500 text-xs mt-1">Loading medicine types...</p>
            )}
          </div>

          <div>
            <Label>Low Stock Warning</Label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="lowStockWarning"
              onChange={handleChange}
              value={medicineData.lowStockWarning}
            />
          </div>
        </form>
      </ModalBody>
      <div className="flex gap-5 justify-end mr-10 pb-5">
        <Button
          className="bg-white  px-2 py-1 h-8 text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  "
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="text-xs px-2 py-1 h-8 bg-sky-800 hover:bg-sky-900"
          onClick={handleSubmit}
        >
          Add Medicine
        </Button>
      </div>
    </Modal>
  );
};
