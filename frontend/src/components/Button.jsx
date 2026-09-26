import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.memo(({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm focus:ring-blue-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-blue-500 shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-sm focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-400'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
