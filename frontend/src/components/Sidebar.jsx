import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Boxes,
  Sparkles,
  Warehouse,
  FileBarChart,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  ScanLine,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Truck,
  History,
  ListFilter
} from 'lucide-react';

export const Sidebar = React.memo(() => {
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Submenu toggle states
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    if (location.pathname.startsWith('/operations')) return 'operations';
    if (location.pathname.startsWith('/inventory')) return 'inventory';
    if (location.pathname.startsWith('/ai')) return 'ai';
    return null;
  });

  const toggleSubmenu = (menuKey) => {
    setOpenSubmenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Boxes className="w-5 h-5 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">Stock<span className="text-blue-600">Sense</span></span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">Inventory SaaS</span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {/* Dashboard */}
        <NavLink to="/dashboard" onClick={closeMobileSidebar} className={navItemClass}>
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Products */}
        <NavLink to="/products" onClick={closeMobileSidebar} className={navItemClass}>
          <Package className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Products</span>}
        </NavLink>

        {/* Operations Dropdown */}
        <div>
          <button
            onClick={() => toggleSubmenu('operations')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname.startsWith('/operations')
                ? 'text-blue-700 bg-blue-50/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Operations</span>}
            </div>
            {!isCollapsed && (
              <span>
                {openSubmenu === 'operations' ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            )}
          </button>

          {!isCollapsed && openSubmenu === 'operations' && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
              <NavLink to="/operations/receipts" onClick={closeMobileSidebar} className={subNavItemClass}>
                <FileCheck className="w-4 h-4" />
                <span>Receipts</span>
              </NavLink>
              <NavLink to="/operations/deliveries" onClick={closeMobileSidebar} className={subNavItemClass}>
                <Truck className="w-4 h-4" />
                <span>Delivery Orders</span>
              </NavLink>
              <NavLink to="/operations/transfers" onClick={closeMobileSidebar} className={subNavItemClass}>
                <RefreshCw className="w-4 h-4" />
                <span>Internal Transfers</span>
              </NavLink>
              <NavLink to="/operations/adjustments" onClick={closeMobileSidebar} className={subNavItemClass}>
                <ListFilter className="w-4 h-4" />
                <span>Stock Adjustments</span>
              </NavLink>
              <NavLink to="/operations/move-history" onClick={closeMobileSidebar} className={subNavItemClass}>
                <History className="w-4 h-4" />
                <span>Move History</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Inventory Dropdown */}
        <div>
          <button
            onClick={() => toggleSubmenu('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname.startsWith('/inventory')
                ? 'text-blue-700 bg-blue-50/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Inventory</span>}
            </div>
            {!isCollapsed && (
              <span>
                {openSubmenu === 'inventory' ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            )}
          </button>

          {!isCollapsed && openSubmenu === 'inventory' && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
              <NavLink to="/inventory" end onClick={closeMobileSidebar} className={subNavItemClass}>
                <Boxes className="w-4 h-4" />
                <span>Overview</span>
              </NavLink>
              <NavLink to="/inventory/ledger" onClick={closeMobileSidebar} className={subNavItemClass}>
                <History className="w-4 h-4" />
                <span>Stock Ledger</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* AI & Smart Dropdown */}
        <div>
          <button
            onClick={() => toggleSubmenu('ai')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname.startsWith('/ai')
                ? 'text-blue-700 bg-blue-50/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-blue-600" />
              {!isCollapsed && <span className="flex items-center gap-1.5">AI & Smart <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full">PRO</span></span>}
            </div>
            {!isCollapsed && (
              <span>
                {openSubmenu === 'ai' ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </span>
            )}
          </button>

          {!isCollapsed && openSubmenu === 'ai' && (
            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
              <NavLink to="/ai/forecast" onClick={closeMobileSidebar} className={subNavItemClass}>
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Demand Forecast</span>
              </NavLink>
              <NavLink to="/ai/reorder" onClick={closeMobileSidebar} className={subNavItemClass}>
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Smart Reorder</span>
              </NavLink>
              <NavLink to="/ai/anomalies" onClick={closeMobileSidebar} className={subNavItemClass}>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Anomaly Detection</span>
              </NavLink>
              <NavLink to="/ai/recommendations" onClick={closeMobileSidebar} className={subNavItemClass}>
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>AI Recommendations</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* QR Scanner */}
        <NavLink to="/scanner" onClick={closeMobileSidebar} className={navItemClass}>
          <ScanLine className="w-5 h-5 shrink-0 text-indigo-600" />
          {!isCollapsed && <span>QR Scanner UI</span>}
        </NavLink>

        {/* Warehouse */}
        <NavLink to="/warehouse" onClick={closeMobileSidebar} className={navItemClass}>
          <Warehouse className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Warehouse</span>}
        </NavLink>

        {/* Reports */}
        <NavLink to="/reports" onClick={closeMobileSidebar} className={navItemClass}>
          <FileBarChart className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Reports</span>}
        </NavLink>

        {/* Notifications */}
        <NavLink to="/notifications" onClick={closeMobileSidebar} className={navItemClass}>
          <Bell className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Notifications</span>}
        </NavLink>

        <div className="pt-2 my-2 border-t border-slate-100" />

        {/* Settings */}
        <NavLink to="/settings" onClick={closeMobileSidebar} className={navItemClass}>
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile" onClick={closeMobileSidebar} className={navItemClass}>
          <User className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Profile</span>}
        </NavLink>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={closeMobileSidebar} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';
