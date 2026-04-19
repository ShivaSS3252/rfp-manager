import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success') => {
    const toast = { id: ++id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);
  }, []);

  const dismiss = useCallback(toastId => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    success: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'text-green-800' },
    error:   { bg: 'bg-red-50 border-red-200',   icon: <XCircle className="w-4 h-4 text-red-600" />,     text: 'text-red-800'   },
    info:    { bg: 'bg-blue-50 border-blue-200',  icon: <AlertCircle className="w-4 h-4 text-blue-600" />, text: 'text-blue-800'  },
  };
  const s = styles[toast.type] || styles.success;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm min-w-[280px] max-w-sm ${s.bg}`}>
      {s.icon}
      <span className={`flex-1 font-medium ${s.text}`}>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.show;
}
