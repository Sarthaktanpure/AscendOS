import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-300 dark:border-[#233044] rounded-xl bg-slate-50/50 dark:bg-[#111827]/40 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{description}</p>}
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-[#1E293B] rounded-lg ${className}`} />
  );
};
