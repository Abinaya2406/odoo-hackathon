import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { operationService } from '../../services/operationService';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/LoadingState';
import { RefreshCw, ShoppingCart, CheckCircle2, Sparkles } from 'lucide-react';

export const SmartReorderPage = () => {
  const { showSuccess, showError } = useToast();
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal target
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    aiService.getSmartReorderItems().then((data) => {
      if (mounted) {
        setReorders(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirmPurchaseRequest = async () => {
    if (!selectedTarget) return;
    setCreating(true);
    try {
      // Create draft receipt in operation service
      await operationService.createReceipt({
        supplier: selectedTarget.supplier || 'Auto Supplier',
        warehouseId: 'wh-1',
        warehouseName: 'Central Distribution Center (Bengaluru)',
        notes: `AI Smart Reorder purchase request (${selectedTarget.urgency} Priority).`,
        status: 'Draft',
        items: [
          {
            productId: selectedTarget.productId,
            productName: selectedTarget.productName,
            quantity: selectedTarget.recommendedOrder,
            unitPrice: 500
          }
        ]
      });

      showSuccess(`Purchase Request created for "${selectedTarget.productName}" (${selectedTarget.recommendedOrder} units). Queued in Receipts!`);
      setSelectedTarget(null);
    } catch (err) {
      showError(err.message || 'Failed to create purchase request.');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <span className="block text-xs font-mono text-slate-400">{row.sku} • Supplier: {row.supplier}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (val) => (
        <span className={`font-mono font-bold ${val === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
          {val} Units
        </span>
      )
    },
    {
      key: 'predicted30DDemand',
      label: '30D Demand',
      render: (val) => <span className="font-mono text-slate-700">{val} Units</span>
    },
    {
      key: 'safetyStock',
      label: 'Safety Buffer',
      render: (val) => <span className="font-mono text-slate-500">{val} Units</span>
    },
    {
      key: 'recommendedOrder',
      label: 'Rec. Order Qty',
      render: (val) => <span className="font-mono font-extrabold text-blue-600 text-sm">{val} Units</span>
    },
    {
      key: 'urgency',
      label: 'Urgency Priority',
      render: (val) => <Badge status={val} />
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <Button
          size="sm"
          variant="primary"
          icon={ShoppingCart}
          onClick={() => setSelectedTarget(row)}
        >
          Create Purchase Request
        </Button>
      )
    }
  ];

  if (loading) return <LoadingState message="Analyzing reorder rules and stock burn rates..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Smart Automated Reorder Engine</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Calculates precise safety buffers and generates purchase orders before stockouts occur</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={reorders}
        emptyTitle="No reorder alerts"
        emptyDescription="All products maintain healthy stock buffers."
      />

      {/* Confirmation Modal */}
      {selectedTarget && (
        <Modal
          isOpen={!!selectedTarget}
          onClose={() => setSelectedTarget(null)}
          title="Create Purchase Request"
          subtitle={`Supplier: ${selectedTarget.supplier}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <p className="font-bold text-sm mb-1">Automated Purchase Order Generation</p>
              This will create a draft supplier receipt for <strong>{selectedTarget.recommendedOrder} units</strong> of <strong>{selectedTarget.productName}</strong>.
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-bold text-slate-900">{selectedTarget.currentStock} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Predicted 30D Demand:</span>
                <span className="font-bold text-slate-900">{selectedTarget.predicted30DDemand} Units</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-700 font-bold">Recommended Purchase Order:</span>
                <span className="font-extrabold text-blue-600">{selectedTarget.recommendedOrder} Units</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSelectedTarget(null)} disabled={creating}>
              Cancel
            </Button>
            <Button variant="primary" icon={CheckCircle2} loading={creating} onClick={handleConfirmPurchaseRequest}>
              Confirm Purchase Request
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
