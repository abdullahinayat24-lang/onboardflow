import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
    secondary: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    outline: 'border border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
