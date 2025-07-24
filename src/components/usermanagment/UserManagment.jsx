import { useState } from "react";
import {
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal,
  ModalBody,
  ModalHeader,
  Label,
} from "flowbite-react";

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const dummyUsers = [
    {
      id: 1,
      name: "Sajid Khan",
      email: "sajid@example.com",
      status: "Pending",
      date: "12/11/2025",
    },
    {
      id: 2,
      name: "Ananya Roy",
      email: "ananya@example.com",
      status: "Pending",
      date: "12/11/2025",
    },
    {
      id: 3,
      name: "Rahul Mehta",
      email: "rahul@example.com",
      status: "Approved",
      date: "12/11/2025",
    },
    {
      id: 4,
      name: "Rahul Mehta",
      email: "rahul@example.com",
      status: "Approved",
      date: "12/11/2025",
    },
    {
      id: 5,
      name: "Rahul Mehta",
      email: "rahul@example.com",
      status: "Rejected",
      date: "12/11/2025",
    },
  ];

  return (
    <div className="p-6  mx-auto ">
      <Button
        size="xs"
        onClick={() => setShowModal(true)}
        className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
      >
        Add User
      </Button>
      <div className="bg-white rounded-xl p-16 shadow ">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>

        <Table
          striped
          className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&>tbody>tr:nth-child(odd)]:bg-gray-200"
        >
          <TableHead className="[&>tr>th]:bg-sky-900 [&>tr>th]:text-white">
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {dummyUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.date}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1  text-sm ${
                      user.status === "Approved"
                        ? "text-green-500"
                        : user.status === "Rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="xs"
                    className="text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Add
                  </Button>
                  <Button
                    size="xs"
                    className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showModal && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <ModalHeader>ADD NEW USERS</ModalHeader>
          <ModalBody>
            <form className="space-y-5">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <input
                  id="username"
                  type="username"
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <input
                  id="username"
                  type="username"
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="email">Role</Label>
                <select
                  id="userRole"
                  className="border bg-white border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none block w-full p-2.5"
                >
                  <option>select</option>
                  <option>Admin</option>
                  <option>User</option>
                  <option>Location Admin</option>
                </select>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  type="submit"
                  className=" text-white bg-[#2D506B] border  hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Add User
                </Button>
                <Button
                  type="submit"
                  onClick={() => setShowModal(false)}
                  className="bg-white text-[#2D506B] hover:bg-blue-50 border border-[#2D506B]  font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Close
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
