import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  Package,
  Layers,
  Zap,
  Settings,
  BatteryCharging,
  Cpu,
  FileCheck,
  Truck,
  ArrowRightLeft,
  ListFilter,
  History,
  Eye,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Building2,
  ScanLine
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ScanResultCard = React.memo(({ product, onDismiss }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const renderIcon = () => {
    switch (product.iconType) {
      case 'zap':
        return <Zap className="w-8 h-8 text-amber-500" />;
      case 'settings':
        return <Settings className="w-8 h-8 text-indigo-500" />;
      case 'cpu':
        return <Cpu className="w-8 h-8 text-blue-500" />;
      case 'battery-charging':
        return <BatteryCharging className="w-8 h-8 text-emerald-500" />;
      case 'layers':
      default:
        return <Layers className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-blue-200" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Verified Barcode / QR Identification
          </span>
        </div>
        <Badge status={product.status} size="sm" />
      </div>

      <div className="p-6 space-y-6">
        {/* Product Identity Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            {renderIcon()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                SKU: {product.sku}
              </span>
              <span className="text-xs text-slate-400 font-mono">Barcode: {product.barcode}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h3>
            <p className="text-xs text-slate-500">{product.category}</p>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 self-start sm:self-center"
            >
              Clear
            </button>
          )}
        </div>

        {/* Specifications & Stock Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Stock</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {product.currentStock} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Reorder Level</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">
              {product.reorderLevel} {product.unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Warehouse</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate" title={product.warehouse}>
              {product.warehouse}
            </span>
            <span className="text-[10px] text-slate-400">{product.storageLocation}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Movement</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {product.lastMovementDate}
            </span>
            <span className="text-[10px] text-slate-400 truncate block">{product.lastMovementType}</span>
          </div>
        </div>

        {/* Quick Actions (All 7 required actions) */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Quick Warehouse Operations
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Eye}
              onClick={() => navigate('/products')}
              className="w-full text-xs"
            >
              View Product
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={Package}
              onClick={() => navigate('/inventory')}
              className="w-full text-xs"
            >
              Check Stock
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={FileCheck}
              onClick={() => navigate(`/operations/receipts/create?sku=${product.sku}`)}
              className="w-full text-xs text-emerald-700 hover:bg-emerald-50"
            >
              Stock In
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={Truck}
              onClick={() => navigate(`/operations/deliveries/create?sku=${product.sku}`)}
              className="w-full text-xs text-blue-700 hover:bg-blue-50"
            >
              Stock Out
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={ArrowRightLeft}
              onClick={() => navigate(`/operations/transfers/create?sku=${product.sku}`)}
              className="w-full text-xs text-purple-700 hover:bg-purple-50"
            >
              Transfer
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={ListFilter}
              onClick={() => navigate(`/operations/adjustments/create?sku=${product.sku}`)}
              className="w-full text-xs text-amber-700 hover:bg-amber-50"
            >
              Adjustment
            </Button>

            <Button
              size="sm"
              variant="outline"
              icon={History}
              onClick={() => navigate('/inventory/ledger')}
              className="w-full text-xs text-slate-700 hover:bg-slate-100"
            >
              View Ledger
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ScanResultCard.displayName = 'ScanResultCard';
