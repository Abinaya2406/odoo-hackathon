import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Select } from './Select';

export const FilterBar = React.memo(({
  filters = [], // [{ key, label, options, value, onChange }]
  onReset,
  className = ''
}) => {
  const safeFilters = Array.isArray(filters) ? filters : [];

  return (
    <div className={`flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200 shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[200px]">
        {safeFilters.map((f) => (
          <div key={f.key} className="min-w-[140px] max-w-[200px]">
            <Select
              placeholder={f.label}
              options={f.options}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="py-1.5 text-xs bg-white"
            />
          </div>
        ))}
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
