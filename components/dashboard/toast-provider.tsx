"use client";

import React, { createContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-4 sm:slide-in-from-right-8 fade-in duration-300 w-full sm:w-80 
              ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100' : 
                toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-100' : 
                'bg-indigo-950/90 border-indigo-500/30 text-indigo-100'}`}
          >
            <div className="flex items-center gap-2.5 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} aria-label="Close notification" className="text-zinc-400 hover:text-zinc-100 transition shrink-0 mt-0.5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
