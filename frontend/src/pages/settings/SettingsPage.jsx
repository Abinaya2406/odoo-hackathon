import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Save, Warehouse, Bell, Sliders, Shield } from 'lucide-react';

export const SettingsPage = () => {
  const { showSuccess } = useToast();

  const [settings, setSettings] = useState({
    defaultWarehouse: 'wh-1',
    skuPrefix: 'SKU-2026-',
    defaultMinStock: 25,
    autoReorder: true,
    emailAlerts: true,
    lowStockAlerts: true,
    anomalyAlerts: true
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showSuccess('System settings & inventory preferences saved successfully!');
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">StockSense System Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure default warehouse policies, safety thresholds, and notification alerts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Warehouse Settings */}
        <Card title="Warehouse & SKU Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Default Operating Warehouse"
              name="defaultWarehouse"
              value={settings.defaultWarehouse}
              onChange={handleChange}
              options={[
                { label: 'Central Distribution Center (Bengaluru)', value: 'wh-1' },
                { label: 'West Regional Hub (Mumbai)', value: 'wh-2' },
                { label: 'North Fulfillment Depot (Delhi NCR)', value: 'wh-3' }
              ]}
            />

            <Input
              label="Auto SKU Generation Prefix"
              name="skuPrefix"
              value={settings.skuPrefix}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Inventory Rules */}
        <Card title="Inventory & Safety Stock Rules">
          <div className="space-y-4">
            <Input
              label="Global Default Minimum Stock Threshold"
              type="number"
              name="defaultMinStock"
              value={settings.defaultMinStock}
              onChange={handleChange}
              helperText="Default minimum units before triggering Low Stock alert"
            />

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Automated AI Reorder Recommendations</span>
                  <span className="text-xs text-slate-500">Allow AI engine to auto-generate draft purchase requests when safety stock is breached</span>
                </div>
                <input
                  type="checkbox"
                  name="autoReorder"
                  checked={settings.autoReorder}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card title="Alerts & Notification Triggers">
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">Email Alerts</span>
                <span className="text-xs text-slate-500">Receive immediate email dispatches for critical stockouts</span>
              </div>
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleChange}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">Low Stock Alerts</span>
                <span className="text-xs text-slate-500">Notify in header bell when items drop below min stock</span>
              </div>
              <input
                type="checkbox"
                name="lowStockAlerts"
                checked={settings.lowStockAlerts}
                onChange={handleChange}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-2">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">AI Anomaly Alerts</span>
                <span className="text-xs text-slate-500">Flag unusual stock depletion velocity automatically</span>
              </div>
              <input
                type="checkbox"
                name="anomalyAlerts"
                checked={settings.anomalyAlerts}
                onChange={handleChange}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" icon={Save} loading={submitting}>
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
