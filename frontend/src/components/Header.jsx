import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { notificationService } from '../services/notificationService';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
  ScanLine
} from 'lucide-react';

export const Header = React.memo(({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    notificationService.getNotifications().then((list) => {
      if (mounted && Array.isArray(list)) {
        const count = list.filter((n) => !n.read).length;
        setUnreadCount(count);
      }
    });
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Title fallback from path
  const getDerivedTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/products/add')) return 'Add New Product';
    if (path.startsWith('/products/') && path.endsWith('/edit')) return 'Edit Product';
    if (path.startsWith('/products')) return 'Product Inventory';
    if (path === '/operations/receipts') return 'Stock Receipts';
    if (path === '/operations/receipts/create') return 'Create Receipt';
    if (path === '/operations/deliveries') return 'Delivery Orders';
    if (path === '/operations/deliveries/create') return 'Create Delivery Order';
    if (path === '/operations/transfers') return 'Internal Stock Transfers';
    if (path === '/operations/transfers/create') return 'Create Internal Transfer';
    if (path === '/operations/adjustments') return 'Stock Adjustments';
    if (path === '/operations/adjustments/create') return 'Create Stock Adjustment';
    if (path === '/operations/move-history') return 'Stock Move Ledger';
    if (path === '/inventory') return 'Inventory Overview';
    if (path === '/inventory/ledger') return 'Stock Movement Timeline';
    if (path === '/ai/forecast') return 'AI Demand Forecast';
    if (path === '/ai/reorder') return 'Smart Reorder Recommendations';
    if (path === '/ai/anomalies') return 'AI Anomaly Detection';
    if (path === '/ai/recommendations') return 'Actionable AI Insights';
    if (path === '/scanner') return 'Barcode & QR Scanner';
    if (path.startsWith('/warehouse')) return 'Warehouse Management';
    if (path === '/reports') return 'Analytics & Reports';
    if (path === '/notifications') return 'Notification Center';
    if (path === '/settings') return 'System Settings';
    if (path === '/profile') return 'My Profile';
    return 'StockSense';
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getDerivedTitle()}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search SKUs, products, receipts, suppliers..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </form>

      {/* Right: Quick actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick QR Scanner Link */}
        <Link
          to="/scanner"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          title="Open QR Scanner"
        >
          <ScanLine className="w-4 h-4 text-blue-600" />
          <span>Scan SKU</span>
        </Link>

        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-100"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Alex Morgan'}
              </span>
              <span className="block text-[10px] font-medium text-slate-500">
                {user?.role || 'Inventory Mgr'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'alex.morgan@stocksense.io'}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
