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
import { LoadingState } from '../../components/LoadingState';
import { validateRequired, validateNumber } from '../../utils/validators';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

export const TransferFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [sourceWhId, setSourceWhId] = useState('wh-1');
  const [sourceLocation, setSourceLocation] = useState('Rack A-12');
  const [destWhId, setDestWhId] = useState('wh-2');
  const [destLocation, setDestLocation] = useState('Rack B-04');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.all([productService.getProducts(), warehouseService.getWarehouses()]).then(
      ([prods, whs]) => {
        if (mounted) {
          const safeProds = Array.isArray(prods) ? prods : [];
          const safeWhs = Array.isArray(whs) ? whs : [];
          setProducts(safeProds);
          setWarehouses(safeWhs);
          if (safeProds.length > 0) setProductId(safeProds[0].id);
          if (safeWhs.length > 1) {
            setSourceWhId(safeWhs[0].id);
            setDestWhId(safeWhs[1].id);
          }
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qtyErr = validateNumber(quantity, 'Transfer Quantity', 1);
    if (qtyErr) {
      setErrors({ quantity: qtyErr });
      return;
    }

    if (sourceWhId === destWhId) {
      setErrors({ destWhId: 'Destination warehouse must be different from source warehouse.' });
      return;
    }

    setSubmitting(true);
    try {
      const prod = products.find((p) => p.id === productId);
      const srcWh = warehouses.find((w) => w.id === sourceWhId);
      const dstWh = warehouses.find((w) => w.id === destWhId);

      const transferData = {
        productId,
        productName: prod ? prod.name : 'Product',
        sku: prod ? prod.sku : 'SKU',
        quantity: Number(quantity),
        sourceWarehouseId: sourceWhId,
        sourceWarehouseName: srcWh ? srcWh.name : 'Source WH',
        sourceLocation,
        destinationWarehouseId: destWhId,
        destinationWarehouseName: dstWh ? dstWh.name : 'Destination WH',
        destinationLocation,
        date
      };

      const created = await operationService.createTransfer(transferData);
      showSuccess(`Stock Transfer ${created.id} executed successfully!`);
      navigate('/operations/transfers');
    } catch (err) {
      showError(err.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading transfer wizard..." />;

  const selectedProd = products.find((p) => p.id === productId);
  const srcWh = warehouses.find((w) => w.id === sourceWhId);
  const dstWh = warehouses.find((w) => w.id === destWhId);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/operations/transfers" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Internal Stock Transfer</h2>
          <p className="text-xs text-slate-500">Relocate stock units between warehouse hubs</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visual Source -> Destination Indicator */}
          <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 rounded-xl border border-blue-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">SOURCE ORIGIN</span>
              <span className="text-sm font-bold text-slate-800 block">{srcWh?.name || 'Source Warehouse'}</span>
              <span className="text-xs text-slate-500">{sourceLocation}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 mt-1">{quantity} Units Transfer</span>
            </div>

            <div className="flex-1 text-center md:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">DESTINATION TARGET</span>
              <span className="text-sm font-bold text-slate-800 block">{dstWh?.name || 'Destination Warehouse'}</span>
              <span className="text-xs text-slate-500">{destLocation}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Product to Transfer"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              options={products.map((p) => ({
                label: `${p.name} (Stock: ${p.currentStock})`,
                value: p.id
              }))}
              required
            />

            <Input
              label="Transfer Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: null }));
              }}
              error={errors.quantity}
              helperText={selectedProd ? `Max available: ${selectedProd.currentStock}` : ''}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Origin Configuration</h4>
              <Select
                label="Source Warehouse"
                value={sourceWhId}
                onChange={(e) => setSourceWhId(e.target.value)}
                options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              />
              <Input
                label="Source Bin / Location"
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value)}
              />
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Destination Configuration</h4>
              <Select
                label="Destination Warehouse"
                value={destWhId}
                onChange={(e) => {
                  setDestWhId(e.target.value);
                  setErrors((prev) => ({ ...prev, destWhId: null }));
                }}
                error={errors.destWhId}
                options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              />
              <Input
                label="Destination Bin / Location"
                value={destLocation}
                onChange={(e) => setDestLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/operations/transfers">
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" icon={RefreshCw} loading={submitting}>
              Execute Stock Transfer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
