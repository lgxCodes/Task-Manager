import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from '../components/ui/ToastContainer/ToastContainer.tsx';
import type { ToastItem } from '../components/ui/Toast/Toast.tsx';
import { ToastContext } from './context.ts';
import type { ToastVariant, ToastAction } from './context.ts';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success', action?: ToastAction) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant, action }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
