import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <main className="pt-[64px] pl-[220px] min-h-screen bg-[#f9f9f9]">
        {/* Adjust padding-top (navbar height) and padding-left (sidebar width) */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
