import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { warehouseService } from '../../services/warehouseService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { validateRequired, validateNumber } from '../../utils/validators';
import { ArrowLeft, Save, Warehouse } from 'lucide-react';

export const WarehouseFormPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [manager, setManager] = useState('');
  const [capacity, setCapacity] = useState(25000);
  const [zones, setZones] = useState('Zone A (Receiving), Zone B (High Velocity), Zone C (Staging)');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateRequired(name, 'Warehouse Name');
    const locErr = validateRequired(location, 'Location');
    const capErr = validateNumber(capacity, 'Capacity Limit', 100);

    const newErrors = {};
    if (nameErr) newErrors.name = nameErr;
    if (locErr) newErrors.location = locErr;
    if (capErr) newErrors.capacity = capErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await warehouseService.createWarehouse({
        name,
        code,
        location,
        manager: manager || 'System Operator',
        capacity: Number(capacity),
        zones: zones.split(',').map((z) => z.trim())
      });

      showSuccess(`Warehouse "${created.name}" created successfully!`);
      navigate('/warehouse');
    } catch (err) {
      showError(err.message || 'Failed to create warehouse.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/warehouse" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Warehouse Distribution Node</h2>
          <p className="text-xs text-slate-500">Configure new logistics depot, manager, and zone layout</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Warehouse Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
              placeholder="e.g. South Logistics Depot (Chennai)"
              required
            />

            <Input
              label="Warehouse Code (Optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WH-CHE-04"
            />

            <Input
              label="Physical Address / Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors((prev) => ({ ...prev, location: null }));
              }}
              error={errors.location}
              placeholder="e.g. Sriperumbudur Industrial Hub, Chennai"
              required
            />

            <Input
              label="Warehouse Manager Name"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Ramanathan K."
            />

            <Input
              label="Maximum Unit Capacity Limit"
              type="number"
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value);
                setErrors((prev) => ({ ...prev, capacity: null }));
              }}
              error={errors.capacity}
              required
            />
          </div>

          <Input
            label="Storage Zones (Comma separated)"
            value={zones}
            onChange={(e) => setZones(e.target.value)}
            helperText="e.g. Zone A, Zone B, Cold Store C"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/warehouse">
              <Button variant="outline" disabled={submitting}>Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" icon={Save} loading={submitting}>
              Create Warehouse
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
