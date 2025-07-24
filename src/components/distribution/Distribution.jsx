import {
  Button,
  Label,
  Datepicker,
  HR,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import { FaBed } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { FaCampground } from "react-icons/fa";
import DistributionListModal from "./DistributionListModal";
import { useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";

const Distribution = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [pendingMode, setPendingMode] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleRadioClick = (mode) => {
    if (!selectedMode) {
      setSelectedMode(mode);
      return;
    }
    if (mode !== selectedMode) {
      setPendingMode(mode);
      setShowModal(true);
    }
  };

  const confirmSwitch = () => {
    setSelectedMode(pendingMode);
    setPendingMode("");
    setShowModal(false);
  };

  const cancelSwitch = () => {
    setPendingMode("");
    setShowModal(false);
  };

  return (
    <div className="m-6 p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Medicine Distribution</h1>
        <Button size="sm" color="light" onClick={() => setIsModalOpen(true)}>
          Distribution List
        </Button>
      </div>
      <HR />

      <div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="hospital"
              name="distributionMode"
              checked={selectedMode === "hospital"}
              onChange={() => handleRadioClick("hospital")}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <div className="flex gap-2 bg-pink-300 rounded-sm">
              <div className="bg-pink-500 p-1  rounded-sm">
                <FaBed className="text-xl text-white" />
              </div>
              <div
                htmlFor="hospital"
                className="text-pink-600 font-semibold text-center pr-2"
              >
                Hospitals
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="camp"
              name="distributionMode"
              checked={selectedMode === "camp"}
              onChange={() => handleRadioClick("camp")}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <div className="flex gap-2 bg-green-300 rounded-sm">
              <div className="bg-green-500 p-1  rounded-sm">
                <FaCampground className="text-xl text-white" />
              </div>
              <div
                htmlFor="camp"
                className="text-green-600 font-semibold text-center pr-2"
              >
                Medical Camps
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="homecare"
              name="distributionMode"
              checked={selectedMode === "homecare"}
              onChange={() => handleRadioClick("homecare")}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <div className="flex gap-2 bg-blue-300 rounded-sm">
              <div className="bg-blue-500 p-1  rounded-sm">
                <FaHome className="text-xl text-white" />
              </div>
              <div
                htmlFor="homecare"
                className="text-blue-600 font-semibold text-center pr-2"
              >
                Home Care
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hospitalName">Hospital Name</Label>
          <select
            id="hospitalName"
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5"
          >
            <option>select</option>
            <option>Motherhood</option>
            <option>Apollo</option>
          </select>
        </div>
        <div>
          <Label htmlFor="distributionDate">Date of Distribution</Label>
          <Datepicker
            id="distributionDate"
            className="custom-datepicker"
            defaultDate={new Date()}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="border border-gray-300">
          <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
            <TableRow>
              <TableHeadCell>Patient name</TableHeadCell>
              <TableHeadCell>Medicine Name</TableHeadCell>
              <TableHeadCell>No Of Medicine</TableHeadCell>
              <TableHeadCell>Unit Type</TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white border-r border-gray-300">
                <select
                  id="hospitalName"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5"
                >
                  <option>select</option>
                  <option>Ranjan Dash</option>
                  <option>Another Patient</option>
                </select>
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  name="medicineName"
                  className="w-full text-black border rounded-md px-3 py-2 text-sm focus:outline-none border-gray-300 focus:ring-1 focus:ring-blue-500"
                  value="Paracetamol"
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  name="quanitity"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none border-gray-300 focus:ring-1 focus:ring-blue-500`}
                  min={1}
                />
              </TableCell>
              <TableCell>
                <select
                  id="hospitalName"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5"
                >
                  <option>select</option>
                  <option>Tablets</option>
                  <option>Capsules</option>
                  <option>ml</option>
                </select>
              </TableCell>
              <TableCell>
                <FaCirclePlus className="text-xl text-[#2D506B]" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Distribute
        </Button>
      </div>
      {isModalOpen && (
        <DistributionListModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* Confirmation Modal */}
      {showModal && (
        <Modal show={showModal} onClose={cancelSwitch}>
          <ModalHeader>Are you sure?</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <p>
                Switching will discard the current data. Do you want to
                continue?
              </p>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={cancelSwitch}
                className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B] font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                className="text-white bg-[#2D506B] border hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Switch
              </button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};
export default Distribution;
