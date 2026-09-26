import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { operationService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { LoadingState } from '../../components/LoadingState';
import { validateNumber } from '../../utils/validators';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export const AdjustmentFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('wh-1');
  const [storageLocation, setStorageLocation] = useState('Rack A-01');
  const [systemQty, setSystemQty] = useState(0);
  const [physicalQty, setPhysicalQty] = useState(0);
  const [reason, setReason] = useState('Physical Audit Discrepancy');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.all([productService.getProducts(), warehouseService.getWarehouses()]).then(
      ([prods, whs]) => {
        if (mounted) {
          const safeProds = Array.isArray(prods) ? prods : [];
          setProducts(safeProds);
          setWarehouses(Array.isArray(whs) ? whs : []);

          if (safeProds.length > 0) {
            setProductId(safeProds[0].id);
            setSystemQty(safeProds[0].currentStock);
            setPhysicalQty(safeProds[0].currentStock);
          }
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const handleProductSelect = (id) => {
    setProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setSystemQty(prod.currentStock);
      setPhysicalQty(prod.currentStock);
      if (prod.warehouseId) setWarehouseId(prod.warehouseId);
      if (prod.storageLocation) setStorageLocation(prod.storageLocation);
    }
  };

  const difference = Number(physicalQty) - Number(systemQty);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const physErr = validateNumber(physicalQty, 'Physical Qty', 0);
    if (physErr) {
      setErrors({ physicalQty: physErr });
      return;
    }
    setConfirmOpen(true);
  };

  const handleApplyAdjustment = async () => {
    setSubmitting(true);
    try {
      const prod = products.find((p) => p.id === productId);
      const wh = warehouses.find((w) => w.id === warehouseId);

      const adjData = {
        productId,
        productName: prod ? prod.name : 'Product',
        sku: prod ? prod.sku : 'SKU',
        warehouseId,
        warehouseName: wh ? wh.name : 'Warehouse',
        storageLocation,
        systemQty: Number(systemQty),
        physicalQty: Number(physicalQty),
        difference,
        reason
      };

      const created = await operationService.createAdjustment(adjData);
      showSuccess(`Adjustment ${created.id} applied! System stock updated.`);
      setConfirmOpen(false);
      navigate('/operations/adjustments');
    } catch (err) {
      showError(err.message || 'Adjustment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading adjustment form..." />;

  const selectedProd = products.find((p) => p.id === productId);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/operations/adjustments" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Stock Adjustment</h2>
          <p className="text-xs text-slate-500">Correct inventory count differences with audit trail</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handlePreSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Product to Adjust"
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              options={products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))}
              required
            />

            <Select
              label="Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              required
            />
          </div>

          {/* Qty comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-100 rounded-xl text-center border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">System Registered Qty</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">{systemQty}</span>
            </div>

            <div className="p-4 bg-white rounded-xl text-center border-2 border-blue-500 shadow-sm">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">Physical Counted Qty</span>
              <input
                type="number"
                value={physicalQty}
                onChange={(e) => {
                  setPhysicalQty(e.target.value);
                  setErrors((prev) => ({ ...prev, physicalQty: null }));
                }}
                className="w-full text-center text-2xl font-bold text-slate-900 font-mono border-b border-slate-300 focus:outline-none focus:border-blue-600 bg-transparent"
              />
              {errors.physicalQty && <p className="text-xs text-rose-600 mt-1">{errors.physicalQty}</p>}
            </div>

            <div className={`p-4 rounded-xl text-center border ${
              difference > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : difference < 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wider block mb-1">Auto Calculated Variance</span>
              <span className="text-2xl font-extrabold font-mono">
                {difference > 0 ? `+${difference}` : difference}
              </span>
            </div>
          </div>

          <Select
            label="Adjustment Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              'Physical Audit Discrepancy',
              'Damaged during handling',
              'Expired stock write-off',
              'Unrecorded stock found',
              'Theft / Loss'
            ]}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/operations/adjustments">
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" icon={Save} loading={submitting}>
              Review & Apply Adjustment
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApplyAdjustment}
        title="Confirm Stock Adjustment"
        message={`Applying this adjustment will update "${selectedProd?.name}" system stock from ${systemQty} to ${physicalQty} units (Variance: ${difference > 0 ? '+' : ''}${difference}). Are you sure?`}
        confirmText="Apply Stock Update"
        variant="primary"
        loading={submitting}
      />
    </div>
  );
};
