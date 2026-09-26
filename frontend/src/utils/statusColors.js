/**
 * Centralized mapping for status colors, badges, and dot indicators
 * Enforces the required StockSense Blue & White design system guidelines
 */

export const getStatusBadgeStyle = (status) => {
  const normalized = String(status || '').toLowerCase().trim();

  switch (normalized) {
    case 'in stock':
    case 'completed':
    case 'done':
    case 'active':
    case 'available':
    case 'success':
    case 'verified':
    case 'low-risk':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: status || 'Done'
      };

    case 'low stock':
    case 'waiting':
    case 'pending':
    case 'medium-risk':
    case 'warning':
    case 'picking':
    case 'packing':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: status || 'Waiting'
      };

    case 'out of stock':
    case 'cancelled':
    case 'critical':
    case 'high-risk':
    case 'anomaly':
    case 'error':
    case 'failed':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: status || 'Out of Stock'
      };

    case 'ready':
    case 'processing':
    case 'in progress':
    case 'info':
    case 'shipped':
    case 'transferring':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: status || 'Ready'
      };

    case 'draft':
    case 'inactive':
    case 'archived':
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        label: status || 'Draft'
      };
  }
};
