import React, { useState } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  Label,
  Datepicker,
} from "flowbite-react";
import { validateAddMedicine } from "../../utils/validate";

export const AddMedicineModal = ({ open, onClose }) => {
  const [medicineData, setMedicineData] = useState({
    existingBatch: "yes",
    modeOfMedicine: "purchased",
    date: new Date(),
    medicineName: "",
    medicineId: "",
    medicineType: "Tablet",
    quantity: 0,
    lowStockWarning: 0,
    cost: "",
    batchNo: "",
  });
  const [errors, setErrors] = useState({
    medicineName: "",
    medicineId: "",
    cost: "",
    batchNo: "",
  });
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
          <div className="flex gap-4">
            <Label>Add medicine to existing batch no?</Label>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="existingBatch"
                id="yes"
                onChange={handleChange}
                checked={medicineData.existingBatch == "yes"}
              />
              <Label>Yes</Label>
              <input
                type="radio"
                name="existingBatch"
                id="no"
                onChange={handleChange}
                checked={medicineData.existingBatch == "no"}
              />
              <Label>No</Label>
            </div>
          </div>
          <div className="flex gap-4">
            <Label>Mode of Medicine?</Label>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="modeOfMedicine"
                id="purchased"
                onChange={handleChange}
                checked={medicineData.modeOfMedicine == "purchased"}
              />
              <Label>Purchased</Label>
              <input
                type="radio"
                name="modeOfMedicine"
                id="donation"
                onChange={handleChange}
                checked={medicineData.modeOfMedicine == "donation"}
              />
              <Label>Donation</Label>
            </div>
          </div>
          <div>
            <Label>Purchase Date</Label>
            <Datepicker
              id="distributionDate"
              className="custom-datepicker"
              defaultDate={new Date()}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Medicine Name</Label>
            <select
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              onChange={handleChange}
              id="medicineName"
              value={medicineData.medicineName}
            >
              <option value="">Select</option>
              <option value="Paracetamol">Paracetamol</option>
              <option value="Ibuprofen">Ibuprofen</option>
              <option value="Amoxicillin">Amoxicillin</option>
            </select>
            {errors.medicineName && (
              <p className="text-red-500 text-xs mt-1">{errors.medicineName}</p>
            )}
          </div>

          <div>
            <Label>Medicine ID</Label>
            <input
              type="text"
              id="medicineId"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              onChange={handleChange}
              value={medicineData.medicineId}
            />
            {errors.medicineId && (
              <p className="text-red-500 text-xs mt-1">{errors.medicineId}</p>
            )}
          </div>

          <div>
            <Label>Medicine Type</Label>
            <select
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="medicineType"
              onChange={handleChange}
              value={medicineData.medicineType}
            >
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <Label>Quantity</Label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="quantity"
              onChange={handleChange}
              value={medicineData.quantity}
            />
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
          <div>
            <Label>Medicine ID</Label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Datepicker
              id="distributionDate"
              className="custom-datepicker"
              defaultDate={new Date()}
            />
          </div>
          <div>
            <Label>Medicine Type</Label>
            <select className="w-full border rounded-lg p-2.5 text-sm border-gray-300">
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label>Quantity</Label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
            />
          </div>
          <div>
            <Label>Medicine Name</Label>
            <input
              type="search"
              placeholder="search"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
            />
          </div>
          <div>
            <Label>Cost</Label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="cost"
              onChange={handleChange}
              value={medicineData.cost}
            />
            {errors.cost && (
              <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
            )}
          </div>
          <div>
            <Label>Batch No</Label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
              id="batchNo"
              onChange={handleChange}
              value={medicineData.batchNo}
            />
            {errors.batchNo && (
              <p className="text-red-500 text-xs mt-1">{errors.batchNo}</p>
            )}
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
