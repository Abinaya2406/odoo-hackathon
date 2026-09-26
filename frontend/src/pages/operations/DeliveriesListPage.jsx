import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { operationService } from '../../services/operationService';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SearchBar } from '../../components/SearchBar';
import { LoadingState } from '../../components/LoadingState';
import { Modal } from '../../components/Modal';
import { formatDate } from '../../utils/formatters';
import { Plus, CheckCircle2, Truck, Package, Box } from 'lucide-react';

export const DeliveriesListPage = () => {
  const { showSuccess, showError } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Workflow Modal
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [step, setStep] = useState('Pick'); // Pick -> Pack -> Validate
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    operationService.getDeliveries().then((data) => {
      if (mounted) {
        setDeliveries(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const openWorkflowModal = (delivery) => {
    setActiveWorkflow(delivery);
    setStep('Pick');
  };

  const handleNextStep = async () => {
    if (step === 'Pick') {
      setStep('Pack');
    } else if (step === 'Pack') {
      setStep('Validate');
    } else if (step === 'Validate') {
      setProcessing(true);
      try {
        const updated = await operationService.validateDelivery(activeWorkflow.id);
        setDeliveries((prev) => prev.map((d) => (d.id === activeWorkflow.id ? updated : d)));
        showSuccess(`Delivery Order ${activeWorkflow.id} completed! Customer dispatched & stock updated downwards.`);
        setActiveWorkflow(null);
      } catch (err) {
        showError(err.message || 'Failed to complete delivery.');
      } finally {
        setProcessing(false);
      }
    }
  };

  const filteredDeliveries = (Array.isArray(deliveries) ? deliveries : []).filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.customer.toLowerCase().includes(q) ||
      d.warehouseName.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'Delivery ID',
      render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span>
    },
    {
      key: 'customer',
      label: 'Customer Name',
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'warehouseName',
      label: 'Dispatch Warehouse',
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'items',
      label: 'Line Items',
      render: (val) => <span className="font-medium text-slate-900">{Array.isArray(val) ? val.length : 0} Products</span>
    },
    {
      key: 'date',
      label: 'Scheduled Date',
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge status={val} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div>
          {row.status !== 'Done' && row.status !== 'Cancelled' ? (
            <Button
              size="sm"
              variant="primary"
              icon={Truck}
              onClick={() => openWorkflowModal(row)}
            >
              Pick & Pack Order
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Dispatched & Done
            </span>
          )}
        </div>
      )
    }
  ];

  if (loading) return <LoadingState message="Fetching delivery orders..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Outbound Delivery Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer shipments with automated Pick → Pack → Validate workflows</p>
        </div>
        <Link to="/operations/deliveries/create">
          <Button variant="primary" icon={Plus}>
            Create Delivery Order
          </Button>
        </Link>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by delivery ID, customer name, warehouse..."
      />

      <Table
        columns={columns}
        data={filteredDeliveries}
        emptyTitle="No delivery orders found"
        emptyDescription="Create a new delivery order to ship products to customers."
      />

      {/* Pick -> Pack -> Validate Stepper Modal */}
      {activeWorkflow && (
        <Modal
          isOpen={!!activeWorkflow}
          onClose={() => setActiveWorkflow(null)}
          title={`Process Delivery ${activeWorkflow.id}`}
          subtitle={`Customer: ${activeWorkflow.customer}`}
        >
          {/* Stepper progress */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className={`flex items-center gap-2 ${step === 'Pick' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'Pick' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>1</div>
              <span>Pick Stock</span>
            </div>
            <div className="h-0.5 w-10 bg-slate-200" />
            <div className={`flex items-center gap-2 ${step === 'Pack' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'Pack' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>2</div>
              <span>Pack Items</span>
            </div>
            <div className="h-0.5 w-10 bg-slate-200" />
            <div className={`flex items-center gap-2 ${step === 'Validate' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'Validate' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>3</div>
              <span>Validate & Dispatch</span>
            </div>
          </div>

          <div className="space-y-4">
            {step === 'Pick' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-sm">
                  <Box className="w-4 h-4 text-amber-600" /> Step 1: Picking Confirmation
                </p>
                Confirm that warehouse picking operators have collected items from their respective racks in {activeWorkflow.warehouseName}.
              </div>
            )}

            {step === 'Pack' && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-sm">
                  <Package className="w-4 h-4 text-blue-600" /> Step 2: Packaging & Quality Check
                </p>
                Verify items are securely packed in corrugated shipping cartons with barcode shipping labels affixed.
              </div>
            )}

            {step === 'Validate' && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 3: Final Dispatch & Stock Reduction
                </p>
                Ready to dispatch! Confirming will decrease product stock counts in {activeWorkflow.warehouseName} and mark order as Completed.
              </div>
            )}

            {/* Item summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-700 block mb-1">Dispatch Items:</span>
              {Array.isArray(activeWorkflow.items) && activeWorkflow.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{it.productName}</span>
                  <span className="font-bold text-slate-900">{it.quantity} Units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setActiveWorkflow(null)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" loading={processing} onClick={handleNextStep}>
              {step === 'Validate' ? 'Complete & Dispatch' : `Proceed to ${step === 'Pick' ? 'Pack' : 'Validate'}`}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
