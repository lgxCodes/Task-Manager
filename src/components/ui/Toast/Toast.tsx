import { useEffect, useRef, useCallback } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
};

type ToastProps = {
  toast: ToastItem;
  onDismiss: (id: string) => void;
};

const variantClasses = {
  success: 'bg-done',
  error: 'bg-danger',
  info: 'bg-accent',
} as const;

export function Toast({ toast, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const remainingRef = useRef(toast.action ? 5000 : 3000);
  const startRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [toast.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, [startTimer]);

  return (
    <div
      className={`${variantClasses[toast.variant]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 animate-[toast-in_300ms_ease-out]`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
    >
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            onDismiss(toast.id);
          }}
          className="bg-white/20 hover:bg-white/30 border-none text-white text-sm font-semibold px-2.5 py-1 rounded cursor-pointer transition-colors"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => onDismiss(toast.id)}
        className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer text-lg leading-none p-0"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
