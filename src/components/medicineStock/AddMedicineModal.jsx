import React from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalHeader,
  Label,
  Datepicker,
} from "flowbite-react";

export const AddMedicineModal = ({ open, onClose }) => {
  const handleChange = (e) => {
    console.log(e.target.id);
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
                defaultChecked
              />
              <Label>Yes</Label>
              <input type="radio" name="existingBatch" id="no" />
              <Label>No</Label>
            </div>
          </div>
          <div className="flex gap-4">
            <Label>Mode of Medicine?</Label>
            <div className="flex items-center gap-3">
              <input type="radio" name="mode" id="purchased" defaultChecked />
              <Label>Purchased</Label>
              <input type="radio" name="mode" id="donation" />
              <Label>Donation</Label>
            </div>
          </div>
          <div>
            <Label>Purchase Date</Label>
            <Datepicker
              id="distributionDate"
              className="custom-datepicker"
              defaultDate={new Date()}
            />
          </div>
          <div>
            <Label>Low Stock Warning</Label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
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
            />
          </div>
          <div>
            <Label>Batch No</Label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm border-gray-300"
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
        <Button className="text-xs px-2 py-1 h-8 bg-sky-800 hover:bg-sky-900">
          Add Medicine
        </Button>
      </div>
    </Modal>
  );
};
