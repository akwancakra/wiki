"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";

type ToastType = "default" | "success" | "destructive";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastType;
  action?: React.ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
    action,
  }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, action }]);

    // Auto dismiss after 8 seconds if there's an action, 5 seconds otherwise
    setTimeout(
      () => {
        dismiss(id);
      },
      action ? 8000 : 5000
    );
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-md border p-4 shadow-md transition-all min-w-80 ${
              toast.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-800"
                : toast.variant === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium">{toast.title}</h3>
                {toast.description && (
                  <p className="text-sm mt-1">{toast.description}</p>
                )}
                {toast.action && <div className="mt-3">{toast.action}</div>}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const toast = (props: Omit<Toast, "id">) => {
  // Fallback untuk penggunaan di luar komponen React
  // Menampilkan alert jika digunakan di luar ToastProvider
  alert(`${props.title}\n${props.description || ""}`);
};
