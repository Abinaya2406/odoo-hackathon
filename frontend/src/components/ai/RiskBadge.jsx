import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export const RiskBadge = React.memo(({ risk, confidence, size = 'md', className = '' }) => {
  const norm = String(risk || '').toLowerCase().trim();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: ShieldCheck,
    label: risk || 'Normal'
  };

  if (norm === 'critical') {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      icon: Flame,
      label: 'Critical Risk'
    };
  } else if (norm === 'high') {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'High Risk'
    };
  } else if (norm === 'medium') {
    config = {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      icon: AlertCircle,
      label: 'Medium Risk'
    };
  } else if (norm === 'low') {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'Low Risk'
    };
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {confidence && (
        <span className="text-[10px] opacity-75 font-mono ml-0.5">({confidence})</span>
      )}
    </span>
  );
});

RiskBadge.displayName = 'RiskBadge';
