import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const Layout = () => {
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);

  useEffect(() => {
    // Ensure layout is mounted before showing content
    setIsLayoutMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Navbar />
      <Sidebar />
      <main 
        className={`pt-[64px] pl-[220px] min-h-screen transition-opacity duration-200 ${
          isLayoutMounted ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {/* Adjust padding-top (navbar height) and padding-left (sidebar width) */}
        {isLayoutMounted && <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
