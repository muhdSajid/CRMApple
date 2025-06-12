import React from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import PaginationComponant from "../common/Pagination";

const FlowbiteUrgencyTable = () => {
  const data = [
    {
      color: "bg-red-700",
      name: "Blood Lancet",
      batches: "02",
      minimum: "100",
      reason: "Expired",
      reasonColor: "text-red-600",
    },
    {
      color: "bg-red-700",
      name: "Soregel",
      batches: "01",
      minimum: "30",
      reason: "Expired",
      reasonColor: "text-red-600",
    },
    {
      color: "bg-blue-700",
      name: "Uni rope 2 inch",
      batches: "02",
      minimum: "100",
      reason: "Out of stock",
      reasonColor: "text-blue-600",
    },
    {
      color: "bg-blue-700",
      name: "100ml NS",
      batches: "03",
      minimum: "200",
      reason: "Out of stock",
      reasonColor: "text-blue-600",
    },
    {
      color: "bg-orange-400",
      name: "5% Dextrose",
      batches: "13",
      minimum: "100",
      reason: "Critically Low",
      reasonColor: "text-orange-400",
    },
  ];

  return (
    <div className="overflow-x-auto py-4">
      <Table striped className="[&>tbody>tr:nth-child(odd)]:bg-gray-200">
        <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
            <TableRow>
            <TableHeadCell>Medicine Name</TableHeadCell>
            <TableHeadCell>No of Batch</TableHeadCell>
            <TableHeadCell>Minimum Required</TableHeadCell>
            <TableHeadCell>Urgency Reason</TableHeadCell>
            <TableHeadCell>Action</TableHeadCell>
            </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded ${item.color}`}></span>
                {item.name}
              </TableCell>
              <TableCell>{item.batches}</TableCell>
              <TableCell>{item.minimum}</TableCell>
              <TableCell className={`font-semibold ${item.reasonColor}`}>
                {item.reason}
              </TableCell>
              <TableCell>
                <button className="text-blue-600 hover:underline text-sm">
                  Act Now
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationComponant />
    </div>
  );
};

export default FlowbiteUrgencyTable;
