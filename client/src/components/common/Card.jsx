import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, footer }) => {
  return (
    <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#233044] rounded-xl shadow-sm transition-all duration-150 ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#0E1420]/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
