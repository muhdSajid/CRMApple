import React from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "flowbite-react";
import { FaEdit, FaTrash } from "react-icons/fa";

const ViewStock = ({ isOpen, onClose }) => {
  const tableData = [
    {
      batch: "CBC182201",
      expiry: "01-04-2025",
      count: "20",
      color: "bg-red-100",
      badge: "bg-red-600",
    },
    {
      batch: "CBC182201",
      expiry: "01-04-2025",
      count: "02",
      color: "bg-orange-100",
      badge: "bg-orange-600",
    },
    {
      batch: "CBC182201",
      expiry: "01-04-2025",
      count: "30",
    },
    {
      batch: "CBC182201",
      expiry: "01-04-2025",
      count: "10",
    },
  ];

  return (
    <Modal show={isOpen} size="3xl" onClose={onClose}>
      <ModalHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold">Medicine Stock</h2>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="mb-8">
          <label className="font-medium mr-4">View Stock Status by</label>
          <div className="inline-flex gap-4">
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="status" defaultChecked />
              All
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="status" />
              Under Stock
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="status" />
              Out of Stock
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table
            hoverable
            striped
            className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap"
          >
            <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white items-center">
              <TableRow>
                <TableHeadCell>Batch Number</TableHeadCell>
                <TableHeadCell>Expiry Date</TableHeadCell>
                <TableHeadCell>No. of Medicines</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {tableData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`w-4 h-4 rounded ${item.badge}`}></span>
                    )}
                    {item.batch}
                  </TableCell>
                  <TableCell>{item.expiry}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="space-x-2 flex justify-end">
                    {item.color ? (
                      <Button size="xs" className="bg-sky-800 hover:bg-sky-900 text-white">
                        Update Stock
                      </Button>
                    ) : null}
                    <button className="text-gray-600 hover:text-blue-500">
                      <FaEdit size={14} />
                    </button>
                    <button className="text-gray-600 hover:text-red-500">
                      <FaTrash size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewStock;
