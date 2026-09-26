import React from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  ShieldAlert,
  User,
  Zap,
  RotateCcw
} from 'lucide-react';

export const AnomalyCard = React.memo(({
  anomaly,
  onSelect,
  onQuickReview,
  isSelected = false
}) => {
  const getSeverityStyle = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return { border: 'border-l-rose-500', badge: 'Critical', bg: 'bg-rose-50/20' };
      case 'high':
        return { border: 'border-l-amber-500', badge: 'High-Risk', bg: 'bg-amber-50/20' };
      case 'medium':
        return { border: 'border-l-blue-500', badge: 'Medium-Risk', bg: 'bg-blue-50/20' };
      default:
        return { border: 'border-l-slate-400', badge: 'Draft', bg: 'bg-slate-50/20' };
    }
  };

  const style = getSeverityStyle(anomaly.severity);

  return (
    <div
      onClick={() => onSelect(anomaly)}
      className={`rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 cursor-pointer border-l-4 ${style.border} ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-md border-blue-300'
          : 'hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-100/70 text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                🚨 {anomaly.eventType}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({anomaly.transactionId})</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{anomaly.productName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={style.badge} size="sm" />
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              anomaly.status === 'Reviewed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : anomaly.status === 'Confirmed'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : anomaly.status === 'Ignored'
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}
          >
            {anomaly.status}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Expected Normal</span>
          <span className="font-semibold text-slate-700">{anomaly.expectedRange}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Detected Actual</span>
          <span className="font-bold text-rose-600 text-sm">{anomaly.actualQuantity} {anomaly.unit}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Warehouse</span>
          <span className="font-medium text-slate-700 truncate block">{anomaly.warehouse}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Logged By</span>
          <span className="font-medium text-slate-700 truncate block">{anomaly.user}</span>
        </div>
      </div>

      {/* Explanation snippet */}
      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
        <strong>Detection Reason:</strong> {anomaly.whyDetected}
      </p>

      {/* Footer & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          {anomaly.dateTime}
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {anomaly.status === 'Unreviewed' && onQuickReview && (
            <Button
              size="sm"
              variant="outline"
              icon={CheckCircle2}
              onClick={() => onQuickReview(anomaly.id)}
            >
              Mark Reviewed
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => onSelect(anomaly)}
          >
            Investigate
          </Button>
        </div>
      </div>
    </div>
  );
});

AnomalyCard.displayName = 'AnomalyCard';
