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
  Modal,
  ModalBody,
  ModalHeader
} from "flowbite-react";
import PaginationComponant from "../common/Pagination";

const DistributionListModal = ({ open, onClose }) => {
  const data = [
    {
      UniqueId: "RNS24239",
      PatientId: "hgfqy65326r4",
      PatientName: "Annanya Jain",
      MedicineName: "c69416d4",
      Qty: 10,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 20,
      UpdatedBy: "Arvind Jain",
    },
    {
      UniqueId: "CC2162202t",
      PatientId: "hgfqy65326r4",
      PatientName: "Kunal Garg",
      MedicineName: "f1e51afb",
      Qty: 456,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 48,
      UpdatedBy: "Deepak Lohani",
    },
    {
      UniqueId: "11231341",
      PatientId: "hgfqy65326r4",
      PatientName: "Vishal Agarwal",
      MedicineName: "75dc5fb1",
      Qty: 12,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 123,
      UpdatedBy: "Lorem Ipsum",
    },
    {
      UniqueId: "CBC182201",
      PatientId: "hgfqy65326r4",
      PatientName: "Mohit Patel",
      MedicineName: "39d7a41e",
      Qty: 4,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 8,
      UpdatedBy: "Arvind Jain",
    },
    {
      UniqueId: "OW B004/24",
      PatientId: "hgfqy65326r4",
      PatientName: "Divya Ray",
      MedicineName: "39d7a41e",
      Qty: 6,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 9,
      UpdatedBy: "Arvind Jain",
    },
    {
      UniqueId: "CC2162202",
      PatientId: "hgfqy65326r4",
      PatientName: "Arpita Panda",
      MedicineName: "78438a93",
      Qty: 35,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 2,
      UpdatedBy: "Lorem Ipsum",
    },
    {
      UniqueId: "BM4-01",
      PatientId: "hgfqy65326r4",
      PatientName: "Mohit Agarwal",
      MedicineName: "78438a93",
      Qty: 9,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 1,
      UpdatedBy: "Deepak Lohani",
    },
    {
      UniqueId: "CC2162202",
      PatientId: "hgfqy65326r4",
      PatientName: "Riya Mittal",
      MedicineName: "5% Dextrose",
      Qty: 9,
      DateOfDistribution: "14-02-2026",
      StockAvailable: 202,
      UpdatedBy: "Deepak Lohani",
    },
  ];

  return (
    <Modal show={open} onClose={onClose} size="7xl">
      <ModalHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold">Medicine Distribution List</h2>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="p-4 bg-gray-50 min-h-screen">
          <Tabs variant="default">
            <TabItem active title="Bangalore" />
            <TabItem title="Mangaluru" />
            <TabItem title="Udupi" />
            <TabItem title="Hassan" />
          </Tabs>

          <div className="flex justify-end items-center">
            <input
              type="text"
              placeholder="Search..."
              className="border px-3 py-2 border-gray-300 rounded-md w-1/4 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
            />
          </div>

          <div className="overflow-x-auto mt-4">
            <Table
              striped
              className="min-w-[1200px] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
            >
              <TableHead>
                <TableHeadCell className="bg-sky-900 text-white">
                  Unique Id
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Patient Id
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Patient Name
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Medicine Name
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Qty
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Date of Distribution
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Stock Available
                </TableHeadCell>
                <TableHeadCell className="bg-sky-900 text-white">
                  Updated By
                </TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.UniqueId}</TableCell>
                    <TableCell>{item.PatientId}</TableCell>
                    <TableCell>{item.PatientName}</TableCell>
                    <TableCell>{item.MedicineName}</TableCell>
                    <TableCell>{item.Qty}</TableCell>
                    <TableCell>{item.DateOfDistribution}</TableCell>
                    <TableCell>{item.StockAvailable}</TableCell>
                    <TableCell>{item.UpdatedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationComponant />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default DistributionListModal;
