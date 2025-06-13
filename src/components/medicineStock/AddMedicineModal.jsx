import React from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";

export const AddMedicineModal = ({ open, onClose }) => {
  return (
    <Modal show={open} onClose={onClose} size="4xl">
      <ModalHeader>Add Medicine</ModalHeader>
      <ModalBody>
        <form className="grid grid-cols-2 gap-6">
          <div className="flex gap-5">
            <label className="block font-medium">
              Add medicine to existing batch no?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input type="radio" name="existingBatch" defaultChecked />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="existingBatch" />
                No
              </label>
            </div>
          </div>

          <div className="flex gap-5">
            <label className="block font-medium ">Mode of Medicine?</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input type="radio" name="mode" defaultChecked />
                Purchased
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="mode" />
                Donation
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Medicine Name</label>
            <select className="w-full border rounded-lg p-2.5 text-sm">
              <option>Paracetamol</option>
              <option>Ibuprofen</option>
              <option>Amoxicillin</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Medicine ID</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Medicine Type</label>
            <select className="w-full border rounded-lg p-2.5 text-sm">
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Low Stock Warning</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Cost</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Batch No</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button>Add Medicine</Button>
      </ModalFooter>
    </Modal>
  );
};
