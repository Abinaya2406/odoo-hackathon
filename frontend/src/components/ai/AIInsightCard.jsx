import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../Badge';
import { Sparkles, ArrowRight } from 'lucide-react';

export const AIInsightCard = React.memo(({
  title,
  subtitle,
  badgeText = 'AI Alert',
  badgeColor = 'blue',
  description,
  actionText = 'View Details',
  actionUrl,
  icon: Icon = Sparkles,
  className = ''
}) => {
  return (
    <div className={`p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">{title}</span>
          </div>
          {badgeText && (
            <Badge status={badgeColor} size="sm">
              {badgeText}
            </Badge>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] font-semibold text-slate-500 mb-1">{subtitle}</p>
        )}

        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          {description}
        </p>
      </div>

      {actionUrl && (
        <Link
          to={actionUrl}
          className="inline-flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 pt-2 border-t border-slate-100 group"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
});

AIInsightCard.displayName = 'AIInsightCard';
