import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const AnomalyFilters = React.memo(({
  filters,
  onChange,
  onReset
}) => {
  const severities = ['All', 'Critical', 'High', 'Medium'];
  const statuses = ['All', 'Unreviewed', 'Reviewed', 'Confirmed', 'Ignored'];
  const warehouses = ['All', 'Main Warehouse', 'West Regional Hub', 'North Fulfillment Depot'];
  const eventTypes = [
    'All',
    'Unusual stock issue',
    'Unusual stock receipt',
    'Sudden stock decrease',
    'Repeated stock adjustment',
    'Abnormal warehouse transfer',
    'Unexpected inventory spike',
    'Unusual transaction frequency'
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search anomaly by SKU, product, user, or reference doc..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Dropdown Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Warehouse Facility
          </label>
          <select
            value={filters.warehouse || 'All'}
            onChange={(e) => onChange({ ...filters, warehouse: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {warehouses.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Anomaly Event Type
          </label>
          <select
            value={filters.eventType || 'All'}
            onChange={(e) => onChange({ ...filters, eventType: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Review Status
          </label>
          <select
            value={filters.status || 'All'}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Severity pill buttons */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 mr-2 shrink-0">Severity:</span>
        {severities.map((sev) => {
          const active = (filters.severity || 'All') === sev;
          return (
            <button
              key={sev}
              onClick={() => onChange({ ...filters, severity: sev })}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          );
        })}
      </div>
    </div>
  );
});

AnomalyFilters.displayName = 'AnomalyFilters';
