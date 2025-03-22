// Toast context provider
import { createContext, useContext, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, type = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              p-4 rounded-lg shadow-lg bg-white border-l-4 min-w-[300px] max-w-sm animate-slide-in
              ${t.type === 'success' ? 'border-green-500' : ''}
              ${t.type === 'error' ? 'border-red-500' : ''}
              ${t.type === 'warning' ? 'border-yellow-500' : ''}
              ${t.type === 'default' ? 'border-purple-500' : ''}
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{t.title}</h4>
                {t.description && <p className="text-gray-600 text-sm mt-1">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}