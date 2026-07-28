import React, { createContext, useContext, useState, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl glass-panel-elevated border shadow-2xl w-full transition-all duration-300 ${
                toast.type === "success" ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.35)]" :
                toast.type === "error" ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.35)]" :
                toast.type === "warning" ? "border-yellow-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)]" :
                "border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 filter drop-shadow-[0_0_3px_rgba(34,197,94,0.8)]" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 filter drop-shadow-[0_0_3px_rgba(239,68,68,0.8)] animate-pulse" />}
                {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500 filter drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-sky-500 filter drop-shadow-[0_0_3px_rgba(56,189,248,0.8)]" />}
                <span className={`text-sm font-tech font-bold tracking-wide ${
                  toast.type === "success" ? "text-green-400" :
                  toast.type === "error" ? "text-red-400" :
                  toast.type === "warning" ? "text-yellow-400" :
                  "text-sky-400"
                }`}>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
