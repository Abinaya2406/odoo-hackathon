import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { warehouseService } from '../../services/warehouseService';
import { productService } from '../../services/productService';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Table } from '../../components/Table';
import { LoadingState } from '../../components/LoadingState';
import { formatNumber } from '../../utils/formatters';
import { ArrowLeft, Warehouse, MapPin, User, Layers, Boxes } from 'lucide-react';

export const WarehouseDetailPage = () => {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([warehouseService.getWarehouseById(id), productService.getProducts()]).then(
      ([wh, prods]) => {
        if (mounted) {
          setWarehouse(wh);
          const safeProds = Array.isArray(prods) ? prods : [];
          setProducts(safeProds.filter((p) => p.warehouseId === id || !p.warehouseId));
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <LoadingState message="Fetching warehouse node diagnostics..." />;

  if (!warehouse) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Warehouse Not Found</h3>
        <Link to="/warehouse" className="mt-2 inline-block text-xs font-bold text-blue-600">Back to Warehouse List</Link>
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          <span className="block text-xs font-mono text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      key: 'storageLocation',
      label: 'Bin / Shelf Location',
      render: (val) => <span className="text-xs font-medium text-slate-700">{val || 'Zone A'}</span>
    },
    {
      key: 'currentStock',
      label: 'Stored Qty',
      render: (val) => <span className="font-bold text-slate-900 font-mono">{val} Units</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/warehouse" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{warehouse.name}</h2>
          <p className="text-xs text-slate-500">{warehouse.code} • {warehouse.location}</p>
        </div>
      </div>

      {/* Info summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Warehouse Manager</span>
          <span className="text-base font-bold text-slate-900">{warehouse.manager}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Total Stored Units</span>
          <span className="text-base font-bold text-blue-600 font-mono">{formatNumber(warehouse.totalQuantity)} Units</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Total Capacity Limit</span>
          <span className="text-base font-bold text-slate-900 font-mono">{formatNumber(warehouse.capacity)} Units</span>
        </div>
      </div>

      {/* Storage Zones */}
      <Card title="Configured Storage Zones & Bays">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Array.isArray(warehouse.zones) &&
            warehouse.zones.map((zone, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{zone}</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Products table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Products Stored in {warehouse.name}</h3>
        <Table columns={columns} data={products} emptyTitle="No products in this warehouse" />
      </div>
    </div>
  );
};
