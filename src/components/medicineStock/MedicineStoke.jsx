import React from "react";
import {
  Tabs,
  TabItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
} from "flowbite-react";
import { FaPlus } from "react-icons/fa6";
import FilterPopover from "../common/Filter";
import PaginationComponant from "../common/Pagination";

const MedicineStock = () => {
  const data = [
    {
      name: "Blood Lancet",
      id: "A3256FD6974B",
      type: "Other",
      batches: "02",
      updatedBy: "Arvind Jain",
      updatedDate: "10-04-2024",
      stockStatus: "Out of Stock",
      stockColor: "text-red-600",
      stockBg: "bg-red-100",
      stockCount: "12/200",
      expiryStatus: "",
      expiryBg: "",
    },
    {
      name: "Aldine Ointment",
      id: "A3256FD6974B",
      type: "Inj",
      batches: "27",
      updatedBy: "Deepak Lohani",
      updatedDate: "10-04-2024",
      stockStatus: "In Stock",
      stockColor: "text-green-600",
      stockBg: "bg-green-100",
      stockCount: "",
      expiryStatus: "07/100 Expired",
      expiryBg: "bg-red-200",
    },
    {
      name: "Blood Lancet",
      id: "A3256FD6974B",
      type: "Other",
      batches: "02",
      updatedBy: "Arvind Jain",
      updatedDate: "10-04-2024",
      stockStatus: "Out of Stock",
      stockColor: "text-red-600",
      stockBg: "bg-red-100",
      stockCount: "12/200",
      expiryStatus: "",
      expiryBg: "",
    },
    {
      name: "Aldine Ointment",
      id: "A3256FD6974B",
      type: "Inj",
      batches: "27",
      updatedBy: "Deepak Lohani",
      updatedDate: "10-04-2024",
      stockStatus: "In Stock",
      stockColor: "text-green-600",
      stockBg: "bg-green-100",
      stockCount: "",
      expiryStatus: "07/100 Expired",
      expiryBg: "bg-red-200",
    },
    {
      name: "Blood Lancet",
      id: "A3256FD6974B",
      type: "Other",
      batches: "02",
      updatedBy: "Arvind Jain",
      updatedDate: "10-04-2024",
      stockStatus: "Out of Stock",
      stockColor: "text-red-600",
      stockBg: "bg-red-100",
      stockCount: "12/200",
      expiryStatus: "",
      expiryBg: "",
    },
    {
      name: "Aldine Ointment",
      id: "A3256FD6974B",
      type: "Inj",
      batches: "27",
      updatedBy: "Deepak Lohani",
      updatedDate: "10-04-2024",
      stockStatus: "In Stock",
      stockColor: "text-green-600",
      stockBg: "bg-green-100",
      stockCount: "",
      expiryStatus: "07/100 Expired",
      expiryBg: "bg-red-200",
    },
    // Add the remaining entries following the above format
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Medicine Stock List</h2>
        </div>

        <Tabs variant="default">
          <TabItem active title="Bangalore" />
          <TabItem title="Mangaluru" />
          <TabItem title="Udupi" />
          <TabItem title="Hassan" />
        </Tabs>

        <div className="flex justify-between items-center mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 border-gray-300 rounded-md w-1/4 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
          />

          <div className="flex gap-2">
            <Button
              color="blue"
              size="sm"
              className="text-xs px-2 py-1 h-8 cursor-pointer bg-sky-800"
            >
              <FaPlus className="mr-2" /> Add Medicine
            </Button>
            <FilterPopover />
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm cursor-pointer">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <Table
            striped
            className="min-w-[1200px] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
          >
            <TableHead>
              <TableHeadCell className="bg-sky-900 text-white">Medicine Name</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Medicine ID</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Medicine Type</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">No of Batches</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Updated By</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Updated Date</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Stock Status</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Expiry Status</TableHeadCell>
              <TableHeadCell className="bg-sky-900 text-white">Actions</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.batches}</TableCell>
                  <TableCell>{item.updatedBy}</TableCell>
                  <TableCell>{item.updatedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.stockStatus && (
                        <span
                          className={`${item.stockColor} text-sm font-semibold`}
                        >
                          {item.stockStatus}
                        </span>
                      )}
                      {item.stockCount && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                          {item.stockCount}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.expiryStatus && (
                      <span
                        className={`${item.expiryBg} text-xs px-2 py-1 rounded-full`}
                      >
                        {item.expiryStatus}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button className="text-blue-500 hover:underline text-sm">
                      ✏️
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <PaginationComponant />
      </div>
    </div>
  );
};

export default MedicineStock;
