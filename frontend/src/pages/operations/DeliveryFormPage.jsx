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
import { Plus, Trash2, ArrowLeft, Truck, Save } from 'lucide-react';

export const DeliveryFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customer, setCustomer] = useState('');
  const [warehouseId, setWarehouseId] = useState('wh-1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const [items, setItems] = useState([
    { productId: '', quantity: 5 }
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
            setItems([{ productId: safeProds[0].id, quantity: 5 }]);
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
    setItems((prev) => [...prev, { productId: firstProd ? firstProd.id : '', quantity: 5 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const custErr = validateRequired(customer, 'Customer Name');
    if (custErr) {
      setErrors({ customer: custErr });
      return;
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find((w) => w.id === warehouseId);
      const deliveryData = {
        customer,
        warehouseId,
        warehouseName: wh ? wh.name : 'Central Warehouse',
        date,
        status: 'Waiting',
        items: items.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            productName: prod ? prod.name : 'Item',
            quantity: Number(item.quantity) || 1
          };
        })
      };

      const created = await operationService.createDelivery(deliveryData);
      showSuccess(`Delivery Order ${created.id} created successfully! Queued for picking.`);
      navigate('/operations/deliveries');
    } catch (err) {
      showError(err.message || 'Failed to create delivery order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading delivery order generator..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/operations/deliveries" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Delivery Order</h2>
          <p className="text-xs text-slate-500">Schedule customer dispatch orders from warehouse inventory</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Customer / Buyer Name"
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                setErrors((prev) => ({ ...prev, customer: null }));
              }}
              error={errors.customer}
              placeholder="e.g. Apex Auto Assembly Ltd."
              required
            />

            <Select
              label="Dispatch Warehouse"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              required
            />

            <Input
              label="Scheduled Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Products to Ship
              </h3>
              <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItem}>
                Add Product Item
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
                      options={products.map((p) => ({
                        label: `${p.name} (Available: ${p.currentStock})`,
                        value: p.id
                      }))}
                    />
                  </div>

                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Order Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/operations/deliveries">
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" icon={Truck} loading={submitting}>
              Create Delivery Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
