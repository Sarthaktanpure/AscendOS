import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-600 dark:hover:bg-indigo-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#1E293B] dark:hover:bg-[#283548] dark:text-slate-200 border border-slate-200/80 dark:border-[#2D3C52]',
    outline: 'border border-slate-300 dark:border-[#2D3C52] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300',
    ghost: 'hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-600 dark:text-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
