import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  Label,
} from "flowbite-react";
import { validateAddMedicine } from "../../utils/validate";
import { getMedicineTypes, getMedicineDetails, updateMedicine } from "../../service/apiService";

export const EditMedicineModal = ({ open, onClose, medicineId, onMedicineUpdated, onShowSuccess }) => {
  const [medicineData, setMedicineData] = useState({
    medicineName: "",
    typeId: 1,
    stockThreshold: "",
  });
  const [errors, setErrors] = useState({
    medicineName: "",
    stockThreshold: "",
  });
  const [medicineTypes, setMedicineTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingMedicine, setLoadingMedicine] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch medicine types when component mounts
  useEffect(() => {
    const fetchMedicineTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getMedicineTypes();
        setMedicineTypes(types);
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

  // Fetch medicine details when medicineId is provided
  useEffect(() => {
    const fetchMedicineDetails = async () => {
      if (!medicineId || !open) return;
      
      try {
        setLoadingMedicine(true);
        const medicineDetails = await getMedicineDetails(medicineId);
        setMedicineData({
          medicineName: medicineDetails.medicineName || "",
          typeId: medicineDetails.typeId || 1,
          stockThreshold: medicineDetails.stockThreshold?.toString() || "",
        });
      } catch (error) {
        console.error('Failed to fetch medicine details:', error);
        alert('Failed to load medicine details. Please try again.');
        onClose();
      } finally {
        setLoadingMedicine(false);
      }
    };

    fetchMedicineDetails();
  }, [medicineId, open, onClose]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let processedValue = value;

    // Convert typeId to number, keep stockThreshold as string for validation
    if (id === 'typeId') {
      processedValue = parseInt(value, 10);
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
        
        // Prepare data for API - convert stockThreshold to number
        const apiData = {
          ...medicineData,
          stockThreshold: parseFloat(medicineData.stockThreshold)
        };
        
        await updateMedicine(medicineId, apiData);
        
        // Reset form data
        setMedicineData({
          medicineName: "",
          typeId: medicineTypes.length > 0 ? medicineTypes[0].id : 1,
          stockThreshold: "",
        });
        setErrors({
          medicineName: "",
          stockThreshold: "",
        });
        
        // Close modal and show success message
        onClose();
        
        // Show success message on parent component
        if (onShowSuccess) {
          onShowSuccess();
        }
        
        // Trigger refresh of medicine data in parent component
        if (onMedicineUpdated) {
          onMedicineUpdated();
        }
      } catch (error) {
        console.error('Error updating medicine:', error);
        alert('Failed to update medicine. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="4xl">
      <ModalHeader>Edit Medicine</ModalHeader>
      <ModalBody>
        {loadingMedicine ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500">Loading medicine details...</span>
          </div>
        ) : (
          <form className="grid grid-cols-2 gap-6 mx-5 mt-3">
            <div>
              <Label>Medicine Name <span className="text-red-500">*</span></Label>
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
              <Label>Medicine Type <span className="text-red-500">*</span></Label>
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
              <Label>Stock Threshold <span className="text-red-500">*</span></Label>
              <input
                type="text"
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
        )}
      </ModalBody>
      <div className="flex gap-5 justify-end mr-10 pb-5">
        <Button
          className="bg-white px-2 py-1 h-8 text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]"
          onClick={onClose}
          disabled={isSubmitting || loadingMedicine}
        >
          Cancel
        </Button>
        <Button
          className="text-xs px-2 py-1 h-8 bg-sky-800 hover:bg-sky-900 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting || loadingMedicine}
        >
          {isSubmitting ? 'Updating...' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
};
