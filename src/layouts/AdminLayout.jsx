import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If session is validating, show generic full screen spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading admin console...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if token is missing
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 dark:bg-dark-900 dark:text-slate-100 flex relative overflow-hidden transition-colors duration-300">
      {/* Premium Ambient Glow Blooms */}
      <div className="ambient-glow-purple" />
      <div className="ambient-glow-blue" />

      {/* Side collapsible drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
      }`}>
        <Navbar 
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />

        {/* Page Content View Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
