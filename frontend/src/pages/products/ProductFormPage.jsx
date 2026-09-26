import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { warehouseService } from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingState } from '../../components/LoadingState';
import { validateRequired, validateNumber } from '../../utils/validators';
import { Save, ArrowLeft, Package } from 'lucide-react';

export const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics & Sensors',
    unit: 'Units',
    supplier: '',
    unitPrice: 500,
    currentStock: 50,
    minStock: 20,
    maxStock: 200,
    reorderQty: 50,
    warehouseId: 'wh-1',
    warehouseName: 'Central Distribution Center (Bengaluru)',
    storageLocation: 'Rack A-01',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const whs = await warehouseService.getWarehouses();
        if (mounted && Array.isArray(whs)) {
          setWarehouses(whs);
        }

        if (isEdit) {
          const prod = await productService.getProductById(id);
          if (mounted && prod) {
            setFormData(prod);
          }
        }
      } catch (err) {
        if (mounted) showError(err.message || 'Error loading product details.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'warehouseId') {
        const foundWh = warehouses.find((w) => w.id === value);
        if (foundWh) updated.warehouseName = foundWh.name;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateRequired(formData.name, 'Product Name');
    if (nameErr) newErrors.name = nameErr;

    const supplierErr = validateRequired(formData.supplier, 'Supplier');
    if (supplierErr) newErrors.supplier = supplierErr;

    const priceErr = validateNumber(formData.unitPrice, 'Unit Price', 0);
    if (priceErr) newErrors.unitPrice = priceErr;

    const stockErr = validateNumber(formData.currentStock, 'Current Stock', 0);
    if (stockErr) newErrors.currentStock = stockErr;

    const minStockErr = validateNumber(formData.minStock, 'Minimum Stock', 0);
    if (minStockErr) newErrors.minStock = minStockErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Please fix validation errors before saving.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await productService.updateProduct(id, formData);
        showSuccess(`Product "${formData.name}" updated successfully.`);
      } else {
        await productService.createProduct(formData);
        showSuccess(`New product "${formData.name}" created successfully.`);
      }
      navigate('/products');
    } catch (err) {
      showError(err.message || 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading product configuration form..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? `Edit Product: ${formData.name}` : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-500">Configure item details, pricing, and warehouse threshold rules</p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Core Product Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g. Wireless Barcode Scanner X-200"
                required
              />

              <Input
                label="SKU (Auto-generated if empty)"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. SKU-ELEC-1001"
                helperText="Leave blank for auto SKU"
              />

              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={[
                  'Electronics & Sensors',
                  'Packaging & Shipping',
                  'Industrial Machinery',
                  'Safety & PPE',
                  'Office & Admin'
                ]}
                required
              />

              <Select
                label="Unit of Measure"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                options={[
                  'Units',
                  'Boxes (10 pcs)',
                  'Packs (50 pcs)',
                  'Rolls',
                  'Pairs',
                  'Kilograms'
                ]}
                required
              />

              <Input
                label="Supplier Name"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                error={errors.supplier}
                placeholder="e.g. LogiTech Solutions"
                required
              />

              <Input
                label="Unit Price (₹)"
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                error={errors.unitPrice}
                required
              />
            </div>
          </div>

          {/* Inventory & Threshold Rules */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Inventory & Threshold Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Current Stock Qty"
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                error={errors.currentStock}
                required
              />

              <Input
                label="Minimum Stock (Safety)"
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                error={errors.minStock}
                required
              />

              <Input
                label="Maximum Stock"
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
              />

              <Input
                label="Reorder Quantity"
                type="number"
                name="reorderQty"
                value={formData.reorderQty}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Storage & Warehouse Assignment */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Warehouse Storage Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Assigned Warehouse"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
                required
              />

              <Input
                label="Storage Bin / Rack Location"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="e.g. Rack A-12, Shelf 3"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/products">
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting} icon={Save}>
              {isEdit ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
