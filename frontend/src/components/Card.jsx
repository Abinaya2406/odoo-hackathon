import React from 'react';

export const Card = React.memo(({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  bodyClassName = '',
  hoverable = false
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${
        hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''
      } ${className}`}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={`p-5 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
