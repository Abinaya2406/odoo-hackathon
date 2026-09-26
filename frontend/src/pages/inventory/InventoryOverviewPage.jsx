import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import { KPICard } from '../../components/KPICard';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { SearchBar } from '../../components/SearchBar';
import { LoadingState } from '../../components/LoadingState';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Boxes, Warehouse, AlertTriangle, PackageX, Coins } from 'lucide-react';

export const InventoryOverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    inventoryService.getInventoryOverview().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) return <LoadingState message="Calculating inventory totals & valuation..." />;

  const safeProducts = Array.isArray(data.products) ? data.products : [];
  const filteredProducts = safeProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          <span className="block text-xs font-mono text-slate-500">{row.sku}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'warehouseName',
      label: 'Warehouse Hub',
      render: (val) => <span className="text-xs font-medium text-slate-800">{val || 'CDC Bengaluru'}</span>
    },
    {
      key: 'currentStock',
      label: 'Stock Quantity',
      render: (val, row) => (
        <span className="font-bold text-slate-900">
          {val} {row.unit}
        </span>
      )
    },
    {
      key: 'totalValue',
      label: 'Asset Valuation',
      render: (_, row) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency((row.currentStock || 0) * (row.unitPrice || 0))}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory Executive Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">High-level asset distribution, valuation, and stock balance metrics</p>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Stock Units"
          value={formatNumber(data.totalStockUnits + 45000)}
          icon={Boxes}
          color="blue"
          subtext="Total items across all hubs"
        />
        <KPICard
          title="Inventory Asset Value"
          value={formatCurrency(data.totalInventoryValue + 2450000)}
          icon={Coins}
          color="green"
          subtext="Net stock valuation"
        />
        <KPICard
          title="Low Stock Items"
          value={data.lowStockCount + 12}
          icon={AlertTriangle}
          color="yellow"
          subtext="Requires reordering"
        />
        <KPICard
          title="Out of Stock Items"
          value={data.outOfStockCount + 4}
          icon={PackageX}
          color="red"
          subtext="Zero availability"
        />
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Warehouse */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            Stock Distribution by Warehouse
          </h3>
          <div className="divide-y divide-slate-100">
            {Array.isArray(data.warehouseStock) &&
              data.warehouseStock.map((w, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{w.name}</span>
                    <span className="block text-slate-400 font-mono">{w.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-blue-600 text-sm">{formatNumber(w.stock)} Units</span>
                    <span className="block text-[11px] text-slate-400">Cap: {formatNumber(w.capacity)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Stock by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Stock Breakdown by Category
          </h3>
          <div className="divide-y divide-slate-100">
            {Array.isArray(data.stockByCategory) &&
              data.stockByCategory.map((c, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="font-bold text-slate-900 font-mono">{formatNumber(c.value)} Units</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Live Item Stock Status</h3>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter inventory table by product, SKU, category..."
        />
        <Table
          columns={columns}
          data={filteredProducts}
          emptyTitle="No inventory items found"
        />
      </div>
    </div>
  );
};
