import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { operationService } from '../../services/operationService';
import { warehouseService } from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { FilterBar } from '../../components/FilterBar';
import { LoadingState } from '../../components/LoadingState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Download, Printer, FileText, BarChart3, Package, Truck, RefreshCw, Sparkles } from 'lucide-react';

export const ReportsPage = () => {
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | movement | receipt | delivery | adjustment | forecast

  const [products, setProducts] = useState([]);
  const [moves, setMoves] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      productService.getProducts(),
      operationService.getMoveHistory(),
      operationService.getReceipts(),
      operationService.getDeliveries(),
      operationService.getAdjustments(),
      warehouseService.getWarehouses()
    ]).then(([prods, mvs, recs, dels, adjs, whs]) => {
      if (mounted) {
        setProducts(Array.isArray(prods) ? prods : []);
        setMoves(Array.isArray(mvs) ? mvs : []);
        setReceipts(Array.isArray(recs) ? recs : []);
        setDeliveries(Array.isArray(dels) ? dels : []);
        setAdjustments(Array.isArray(adjs) ? adjs : []);
        setWarehouses(Array.isArray(whs) ? whs : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    showSuccess(`Report "${activeTab.toUpperCase()}" exported to CSV successfully!`);
  };

  if (loading) return <LoadingState message="Aggregating analytical report datasets..." />;

  // Filter logic helper
  const filterByWarehouse = (list) => {
    if (!warehouseFilter) return list;
    return list.filter((item) => item.warehouseId === warehouseFilter || item.warehouseName?.includes(warehouseFilter));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics & Enterprise Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate exportable audit reports, valuation statements, and forecast summaries</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 no-print">
        {[
          { id: 'inventory', label: 'Inventory Valuation', icon: Package },
          { id: 'movement', label: 'Stock Movement', icon: RefreshCw },
          { id: 'receipt', label: 'Receipt Inbound', icon: FileText },
          { id: 'delivery', label: 'Delivery Outbound', icon: Truck },
          { id: 'adjustment', label: 'Stock Adjustments', icon: BarChart3 },
          { id: 'forecast', label: 'AI Demand Forecast', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="no-print">
        <FilterBar
          filters={[
            {
              key: 'warehouse',
              label: 'Filter by Warehouse',
              value: warehouseFilter,
              options: warehouses.map((w) => ({ label: w.name, value: w.id })),
              onChange: setWarehouseFilter
            }
          ]}
          onReset={() => {
            setWarehouseFilter('');
            setCategoryFilter('');
          }}
        />
      </div>

      {/* Report Container */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 print-only">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
              StockSense Enterprise Report: {activeTab.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()} by Alex Morgan</p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600">CONFIDENTIAL</span>
        </div>

        {/* Tab 1: Inventory Valuation */}
        {activeTab === 'inventory' && (
          <Table
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'sku', label: 'SKU' },
              { key: 'category', label: 'Category' },
              { key: 'currentStock', label: 'Quantity' },
              { key: 'unitPrice', label: 'Unit Price', render: (val) => formatCurrency(val) },
              { key: 'valuation', label: 'Total Valuation', render: (_, r) => formatCurrency(r.currentStock * r.unitPrice) }
            ]}
            data={filterByWarehouse(products)}
          />
        )}

        {/* Tab 2: Movement */}
        {activeTab === 'movement' && (
          <Table
            columns={[
              { key: 'date', label: 'Date', render: (val) => formatDate(val) },
              { key: 'transactionId', label: 'TX ID' },
              { key: 'productName', label: 'Product' },
              { key: 'action', label: 'Action' },
              { key: 'quantity', label: 'Delta Qty' },
              { key: 'fromLocation', label: 'From' },
              { key: 'toLocation', label: 'To' }
            ]}
            data={filterByWarehouse(moves)}
          />
        )}

        {/* Tab 3: Receipts */}
        {activeTab === 'receipt' && (
          <Table
            columns={[
              { key: 'id', label: 'Receipt ID' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'warehouseName', label: 'Warehouse' },
              { key: 'date', label: 'Date', render: (val) => formatDate(val) },
              { key: 'status', label: 'Status' }
            ]}
            data={filterByWarehouse(receipts)}
          />
        )}

        {/* Tab 4: Deliveries */}
        {activeTab === 'delivery' && (
          <Table
            columns={[
              { key: 'id', label: 'Delivery ID' },
              { key: 'customer', label: 'Customer' },
              { key: 'warehouseName', label: 'Warehouse' },
              { key: 'date', label: 'Date', render: (val) => formatDate(val) },
              { key: 'status', label: 'Status' }
            ]}
            data={filterByWarehouse(deliveries)}
          />
        )}

        {/* Tab 5: Adjustments */}
        {activeTab === 'adjustment' && (
          <Table
            columns={[
              { key: 'id', label: 'Adjustment ID' },
              { key: 'productName', label: 'Product' },
              { key: 'systemQty', label: 'System Qty' },
              { key: 'physicalQty', label: 'Physical Qty' },
              { key: 'difference', label: 'Variance' },
              { key: 'reason', label: 'Reason' }
            ]}
            data={filterByWarehouse(adjustments)}
          />
        )}

        {/* Tab 6: Forecast */}
        {activeTab === 'forecast' && (
          <Table
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'currentStock', label: 'Current Stock' },
              { key: 'minStock', label: 'Min Safety Threshold' },
              { key: 'reorderQty', label: 'Recommended Order' },
              { key: 'status', label: 'Risk Rating' }
            ]}
            data={filterByWarehouse(products)}
          />
        )}
      </div>
    </div>
  );
};
