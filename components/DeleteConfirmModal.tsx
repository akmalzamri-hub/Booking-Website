"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatDisplayDate, type TempahanRecord } from "@/lib/booking";

interface DeleteConfirmModalProps {
  record: TempahanRecord | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteConfirmModal({
  record,
  deleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!record) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [record, deleting, onCancel]);

  return (
    <AnimatePresence>
      {record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!deleting) onCancel();
            }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="font-display text-base font-bold text-slate-900"
                >
                  Padam Rekod Tempahan?
                </h2>
                <p
                  id="delete-modal-desc"
                  className="mt-1.5 text-sm text-slate-600"
                >
                  Tindakan ini akan memadam rekod tempahan{" "}
                  <strong className="font-semibold text-slate-900">
                    {record.nama_pemohon}
                  </strong>{" "}
                  bagi{" "}
                  <strong className="font-semibold text-slate-900">
                    {record.item_tempahan}
                  </strong>{" "}
                  pada{" "}
                  <span className="font-mono text-xs tabular-nums">
                    {formatDisplayDate(record.tarikh)} ({record.slot_masa})
                  </span>{" "}
                  secara kekal.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={onConfirm}
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                {deleting && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Ya, Padam
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
