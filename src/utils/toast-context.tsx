// src/components/ui/toast-context.tsx
import type { ColorPaletteProp } from '@mui/joy/styles';
import{ createContext, useContext, useState, useCallback } from 'react';
import type{ ReactNode} from 'react';

interface Toast {
   id?:any;
      color: ColorPaletteProp;
      message:string;
      action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: ({ message, color, action }: { message: string; color: ColorPaletteProp; action?: { label: string; onClick: () => void } }) => void;
  removeToast: (id:string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ message, color, action }: { message: string; color: ColorPaletteProp; action?: { label: string; onClick: () => void } }) => {
    const id = Date.now() + Math.random(); 
    setToasts(prev => [...prev, { id, message, color, action }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id:any) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};