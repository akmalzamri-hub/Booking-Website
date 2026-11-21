"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface ToastItem {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi sistem"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          return (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg ${
                isSuccess ? "border-emerald-200" : "border-red-200"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                  aria-hidden="true"
                />
              )}
              <p className="flex-1 text-sm font-medium text-slate-800">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Tutup notifikasi"
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
