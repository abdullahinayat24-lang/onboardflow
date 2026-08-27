'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, options?: { message?: string; type?: ToastType }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, options?: { message?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        title,
        message: options?.message,
        type: options?.type || 'info',
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'error' });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'info' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200',
              item.type === 'success' && 'bg-emerald-50/95 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-50',
              item.type === 'error' && 'bg-rose-50/95 border-rose-200 text-rose-950 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-50',
              item.type === 'info' && 'bg-white/95 border-zinc-200 text-zinc-900 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-50'
            )}
          >
            {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {item.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.message && <p className="text-xs mt-0.5 opacity-90">{item.message}</p>}
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
