import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const KPICard = React.memo(({
  title,
  value,
  change,
  changeType = 'increase', // increase | decrease | neutral
  icon: Icon,
  color = 'blue', // blue | green | yellow | red | purple | gray
  subtext
}) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    purple: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    gray: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              changeType === 'increase'
                ? 'bg-emerald-50 text-emerald-700'
                : changeType === 'decrease'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {changeType === 'increase' && <TrendingUp className="w-3 h-3 mr-1" />}
            {changeType === 'decrease' && <TrendingDown className="w-3 h-3 mr-1" />}
            {changeType === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-500 font-medium">{subtext}</p>
      )}
    </div>
  );
});

KPICard.displayName = 'KPICard';
