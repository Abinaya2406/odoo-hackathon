import React from 'react';

export const ChartCard = React.memo(({
  title,
  subtitle,
  action,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="w-full flex-1 min-h-[260px]">{children}</div>
    </div>
  );
});

ChartCard.displayName = 'ChartCard';
