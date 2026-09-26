import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ToastContainer } from '../components/ToastContainer';
import { useSidebar } from '../context/SidebarContext';

export const AppLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};
