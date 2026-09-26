import React from 'react';
import { Outlet } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { ToastContainer } from '../components/ToastContainer';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4">
          <Boxes className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Stock<span className="text-blue-400">Sense</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Smart Enterprise Inventory & Supply Chain Intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-100 sm:px-10">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} StockSense SaaS. All rights reserved. Encrypted 256-bit security.
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};
