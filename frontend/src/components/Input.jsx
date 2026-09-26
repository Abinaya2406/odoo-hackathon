import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon = null,
  rightElement = null,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || `input-${Math.random()}`;

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-lg border text-sm text-slate-900 placeholder-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            Icon ? 'pl-9' : 'pl-3'
          } ${rightElement ? 'pr-10' : 'pr-3'} ${
            error
              ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } py-2 ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
