import React from 'react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || props.name || `select-${Math.random()}`;
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-lg border text-sm text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 bg-white appearance-none cursor-pointer ${
            error
              ? 'border-rose-300 bg-rose-50/30 text-rose-900'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {safeOptions.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={`opt-${idx}-${val}`} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
