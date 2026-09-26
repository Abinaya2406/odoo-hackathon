import React from 'react';
import { PackageX } from 'lucide-react';

export const EmptyState = React.memo(({
  title = 'No data available',
  description = 'There are no records to display right now.',
  icon: Icon = PackageX,
  action = null,
  className = ''
}) => {
  return (
    <div className={`p-8 my-4 text-center rounded-xl bg-white border border-slate-200 border-dashed flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
