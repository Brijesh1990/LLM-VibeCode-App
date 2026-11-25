import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20',
    secondary: 'bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-sm shadow-cyan-500/20',
    accent: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm shadow-violet-500/20',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    success: 'bg-[#16A34A] hover:bg-green-700 text-white shadow-sm',
    danger: 'bg-[#EF4444] hover:bg-red-700 text-white shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
}
