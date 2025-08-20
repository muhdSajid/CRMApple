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
import { getMedicineTypes, addMedicine } from "../../service/apiService";

export const AddMedicineModal = ({ open, onClose }) => {
  const [medicineData, setMedicineData] = useState({
    medicineName: "",
    typeId: 1,
    stockThreshold: 0,
  });
  const [errors, setErrors] = useState({
    medicineName: "",
    stockThreshold: "",
  });
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            typeId: types[0].id
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
    const { id, value } = e.target;
    let processedValue = value;

    // Convert typeId to number and stockThreshold to number
    if (id === 'typeId') {
      processedValue = parseInt(value, 10);
    } else if (id === 'stockThreshold') {
      processedValue = parseInt(value, 10) || 0;
    }

    setMedicineData({ ...medicineData, [id]: processedValue });

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateAddMedicine(medicineData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsSubmitting(true);
        await addMedicine(medicineData);
        
        // Reset form data
        setMedicineData({
          medicineName: "",
          typeId: medicineTypes.length > 0 ? medicineTypes[0].id : 1,
          stockThreshold: 0,
        });
        setErrors({
          medicineName: "",
          stockThreshold: "",
        });
        
        // Close modal and show success message
        onClose();
        alert('Medicine added successfully!'); // You can replace this with a toast notification
      } catch (error) {
        console.error('Error adding medicine:', error);
        alert('Failed to add medicine. Please try again.'); // You can replace this with a toast notification
      } finally {
        setIsSubmitting(false);
      }
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
              id="typeId"
              onChange={handleChange}
              value={medicineData.typeId}
              disabled={loadingTypes}
            >
              {loadingTypes ? (
                <option>Loading...</option>
              ) : (
                medicineTypes.map((type) => (
                  <option key={type.id} value={type.id}>
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
            <Label>Stock Threshold</Label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="stockThreshold"
              onChange={handleChange}
              value={medicineData.stockThreshold}
              placeholder="Enter minimum stock level"
            />
            {errors.stockThreshold && (
              <p className="text-red-500 text-xs mt-1">{errors.stockThreshold}</p>
            )}
          </div>
        </form>
      </ModalBody>
      <div className="flex gap-5 justify-end mr-10 pb-5">
        <Button
          className="bg-white  px-2 py-1 h-8 text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  "
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          className="text-xs px-2 py-1 h-8 bg-sky-800 hover:bg-sky-900 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Medicine'}
        </Button>
      </div>
    </Modal>
  );
};
