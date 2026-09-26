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
import { validateRequired } from '../../utils/validators';
import { Plus, Trash2, ArrowLeft, CheckCircle2, Save } from 'lucide-react';

export const ReceiptFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [supplier, setSupplier] = useState('');
  const [warehouseId, setWarehouseId] = useState('wh-1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const [items, setItems] = useState([
    { productId: '', quantity: 10, unitPrice: 500 }
  ]);

  useEffect(() => {
    let mounted = true;
    Promise.all([productService.getProducts(), warehouseService.getWarehouses()]).then(
      ([prods, whs]) => {
        if (mounted) {
          const safeProds = Array.isArray(prods) ? prods : [];
          setProducts(safeProds);
          setWarehouses(Array.isArray(whs) ? whs : []);
          if (safeProds.length > 0) {
            setItems([{ productId: safeProds[0].id, quantity: 20, unitPrice: safeProds[0].unitPrice }]);
          }
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      { productId: firstProd ? firstProd.id : '', quantity: 10, unitPrice: firstProd ? firstProd.unitPrice : 100 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) updated[index].unitPrice = prod.unitPrice;
      }
      return updated;
    });
  };

  const handleSubmit = async (validateNow = false) => {
    const suppErr = validateRequired(supplier, 'Supplier Name');
    if (suppErr) {
      setErrors({ supplier: suppErr });
      return;
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find((w) => w.id === warehouseId);
      const receiptData = {
        supplier,
        warehouseId,
        warehouseName: wh ? wh.name : 'Central Warehouse',
        date,
        notes,
        status: validateNow ? 'Done' : 'Draft',
        items: items.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            productName: prod ? prod.name : 'Item',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0
          };
        })
      };

      const created = await operationService.createReceipt(receiptData);
      if (validateNow) {
        await operationService.validateReceipt(created.id);
        showSuccess(`Receipt ${created.id} validated! Stock updated upwards.`);
      } else {
        showSuccess(`Draft Receipt ${created.id} created successfully.`);
      }
      navigate('/operations/receipts');
    } catch (err) {
      showError(err.message || 'Failed to create receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Setting up stock receipt generator..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/operations/receipts" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create New Stock Receipt</h2>
          <p className="text-xs text-slate-500">Record inbound inventory items delivered from suppliers</p>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Supplier Name"
              value={supplier}
              onChange={(e) => {
                setSupplier(e.target.value);
                setErrors((prev) => ({ ...prev, supplier: null }));
              }}
              error={errors.supplier}
              placeholder="e.g. LogiTech Solutions"
              required
            />

            <Select
              label="Destination Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              required
            />

            <Input
              label="Receipt Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Line Items
              </h3>
              <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItem}>
                Add Line Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={`item-${idx}`} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-1 min-w-[200px]">
                    <Select
                      placeholder="Select Product"
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      options={products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))}
                    />
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    />
                  </div>

                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <Input
            label="Additional Notes / Ref PO"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Purchase order PO-9921 verification notes..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/operations/receipts">
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </Link>
            <Button
              variant="secondary"
              icon={Save}
              loading={submitting}
              onClick={() => handleSubmit(false)}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              loading={submitting}
              onClick={() => handleSubmit(true)}
            >
              Validate & Receive Stock
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
