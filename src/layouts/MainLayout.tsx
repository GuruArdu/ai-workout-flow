
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Toolbar/Sidebar";
import BottomNav from "../components/Toolbar/BottomNav";

const MainLayout = () => {
  console.log("Rendering MainLayout");
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-60 pb-16 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
