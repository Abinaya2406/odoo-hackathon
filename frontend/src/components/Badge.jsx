import React from 'react';
import { getStatusBadgeStyle } from '../utils/statusColors';

export const Badge = React.memo(({
  status,
  children,
  variant, // override variant if passed directly
  showDot = true,
  size = 'md',
  className = ''
}) => {
  const content = children || status;
  const style = getStatusBadgeStyle(status || variant);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      )}
      <span>{content}</span>
    </span>
  );
});

Badge.displayName = 'Badge';
