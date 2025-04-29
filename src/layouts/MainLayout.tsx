
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Toolbar/Sidebar";
import BottomNav from "../components/Toolbar/BottomNav";
import { toast } from "@/components/ui/use-toast";

const MainLayout = () => {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Check if dev mode is enabled in localStorage
    const isDevMode = localStorage.getItem('devModeEnabled') === 'true';
    setDevMode(isDevMode);
  }, []);

  // Only show dev tools in development environment
  const isDevelopment = import.meta.env.DEV;

  const toggleDevMode = () => {
    const newMode = !devMode;
    localStorage.setItem('devModeEnabled', newMode.toString());
    setDevMode(newMode);
    
    toast({
      title: newMode ? "Dev Mode Enabled" : "Dev Mode Disabled",
      description: newMode 
        ? "You can now access protected routes without authentication." 
        : "Authentication is now required for protected routes.",
      duration: 3000
    });
    
    // Refresh to apply changes
    setTimeout(() => window.location.reload(), 1000);
  };
  
  console.log("Rendering MainLayout");
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-60 pb-16 md:pb-0 min-h-screen relative z-0">
        {isDevelopment && (
          <div className="fixed top-2 right-2 z-50">
            <button
              onClick={toggleDevMode}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                devMode 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {devMode ? "Dev Mode: ON" : "Dev Mode: OFF"}
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
