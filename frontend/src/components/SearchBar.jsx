import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = React.memo(({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search by product, SKU, supplier...',
  className = ''
}) => {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange(''))}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
