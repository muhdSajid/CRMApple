import {
  Button,
  Select,
  Label,
  TextInput,
  Radio,
  Datepicker,
  HR,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { FaBed } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { FaCampground } from "react-icons/fa";
import DistributionListModal from "./DistributionListModal";
import { useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";

const Distribution = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Medicine Distribution</h1>
        <Button size="sm" color="light" onClick={() => setIsModalOpen(true)}>
          Distribution List
        </Button>
      </div>
      <HR />

      <div>
        <div className="flex gap-6">
          <Label className="">Select</Label>
          <div className="flex items-center gap-2">
            <Radio id="hospital" name="distributionMode" />
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
            <Radio id="camp" name="distributionMode" />
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
            <Radio id="homecare" name="distributionMode" />
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
          <Select id="hospitalName" required>
            <option>Motherhood</option>
            <option>Apollo</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="distributionDate">Date of Distribution</Label>
          <Datepicker
            id="distributionDate"
            defaultDate={new Date("2025-02-26")}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHead className="[&>tr>th]:bg-[#E8EFF2] [&>tr>th]:text-black">
            <TableRow>
              <TableHeadCell>Patient name</TableHeadCell>
              <TableHeadCell>Medicine Name</TableHeadCell>
              <TableHeadCell></TableHeadCell>
              <TableHeadCell>Quantity</TableHeadCell>
              <TableHeadCell>Unit Type</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <Select>
                  <option>Ranjan Dash</option>
                  <option>Another Patient</option>
                </Select>
              </TableCell>
              <TableCell>
                <TextInput type="text" value="Paracetamol" />
              </TableCell>
              <TableCell>
                <FaCirclePlus className="text-xl text-[#2D506B]" />
              </TableCell>
              <TableCell>
                <TextInput type="number" min={1} />
              </TableCell>
              <TableCell>
                <Select>
                  <option>Tablets</option>
                  <option>Capsules</option>
                  <option>ml</option>
                </Select>
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
    </div>
  );
};
export default Distribution;
