"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  PERALATAN_ITEMS,
  RUANG_ITEMS,
  STATUS_VALUES,
  TIME_SLOTS,
  formatDateKey,
  getTodayDateKey,
  validateCreatePayload,
  validateUpdatePayload,
  type BookingStatus,
  type TempahanRecord,
} from "@/lib/booking";

export interface BookingFormValues {
  nama_pemohon: string;
  item_tempahan: string;
  tarikh: string;
  slot_masa: string;
  status: BookingStatus;
}

interface BookingFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialRecord: TempahanRecord | null;
  submitting: boolean;
  serverFieldErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
}

function getDefaultValues(
  mode: "create" | "edit",
  initialRecord: TempahanRecord | null
): BookingFormValues {
  if (mode === "edit" && initialRecord) {
    return {
      nama_pemohon: initialRecord.nama_pemohon,
      item_tempahan: initialRecord.item_tempahan,
      tarikh: formatDateKey(initialRecord.tarikh) || getTodayDateKey(),
      slot_masa: initialRecord.slot_masa,
      status: (STATUS_VALUES as readonly string[]).includes(initialRecord.status)
        ? (initialRecord.status as BookingStatus)
        : "Menunggu",
    };
  }

  return {
    nama_pemohon: "",
    item_tempahan: RUANG_ITEMS[0],
    tarikh: getTodayDateKey(),
    slot_masa: TIME_SLOTS[0],
    status: "Menunggu",
  };
}

export function BookingFormModal({
  open,
  mode,
  initialRecord,
  submitting,
  serverFieldErrors,
  onClose,
  onSubmit,
}: BookingFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <BookingFormDialog
          key={`${mode}-${initialRecord?.id ?? "new"}`}
          mode={mode}
          initialRecord={initialRecord}
          submitting={submitting}
          serverFieldErrors={serverFieldErrors}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </AnimatePresence>
  );
}

function BookingFormDialog({
  mode,
  initialRecord,
  submitting,
  serverFieldErrors,
  onClose,
  onSubmit,
}: Omit<BookingFormModalProps, "open">) {
  const [values, setValues] = useState<BookingFormValues>(() =>
    getDefaultValues(mode, initialRecord)
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [dismissedServerFields, setDismissedServerFields] = useState<
    Record<string, boolean>
  >({});

  const fieldErrors: Record<string, string> = {};
  if (serverFieldErrors) {
    for (const [k, v] of Object.entries(serverFieldErrors)) {
      if (!dismissedServerFields[k]) {
        fieldErrors[k] = v;
      }
    }
  }
  for (const [k, v] of Object.entries(clientErrors)) {
    fieldErrors[k] = v;
  }

  const updateField = <K extends keyof BookingFormValues>(
    field: K,
    value: BookingFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setClientErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setDismissedServerFields((prev) =>
      prev[field] ? prev : { ...prev, [field]: true }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result =
      mode === "create"
        ? validateCreatePayload(values)
        : validateUpdatePayload(values);

    if (!result.ok) {
      setClientErrors(result.errors);
      return;
    }

    setClientErrors({});
    setDismissedServerFields({});
    await onSubmit({
      ...values,
      nama_pemohon: values.nama_pemohon.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => {
          if (!submitting) onClose();
        }}
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="booking-modal-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              {mode === "create"
                ? "Tambah Tempahan Baharu"
                : `Kemaskini Tempahan #${String(initialRecord?.id ?? "").padStart(3, "0")}`}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {mode === "create"
                ? "Lengkapkan maklumat pemohon, ruang atau peralatan, serta slot masa."
                : "Ubah butiran tempahan atau status kelulusan di bawah."}
            </p>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Tutup borang tempahan"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="form-nama-pemohon"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Nama Pemohon <span className="text-red-600">*</span>
            </label>
            <input
              id="form-nama-pemohon"
              type="text"
              required
              value={values.nama_pemohon}
              onChange={(e) => updateField("nama_pemohon", e.target.value)}
              placeholder="Contoh: Ahmad Danial bin Hakim"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            {fieldErrors.nama_pemohon && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.nama_pemohon}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="form-item-tempahan"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Item Tempahan (Ruang / Peralatan){" "}
              <span className="text-red-600">*</span>
            </label>
            <select
              id="form-item-tempahan"
              value={values.item_tempahan}
              onChange={(e) => updateField("item_tempahan", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <optgroup label="Ruang Kampus">
                {RUANG_ITEMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Peralatan Studio & Sukan">
                {PERALATAN_ITEMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            </select>
            {fieldErrors.item_tempahan && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.item_tempahan}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="form-tarikh"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Tarikh <span className="text-red-600">*</span>
              </label>
              <input
                id="form-tarikh"
                type="date"
                required
                value={values.tarikh}
                onChange={(e) => updateField("tarikh", e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              {fieldErrors.tarikh && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.tarikh}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="form-slot-masa"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Slot Masa <span className="text-red-600">*</span>
              </label>
              <select
                id="form-slot-masa"
                value={values.slot_masa}
                onChange={(e) => updateField("slot_masa", e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {fieldErrors.slot_masa && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {fieldErrors.slot_masa}
                </p>
              )}
            </div>
          </div>

          {mode === "edit" && (
            <div>
              <label
                htmlFor="form-status"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Status Kelulusan
              </label>
              <select
                id="form-status"
                value={values.status}
                onChange={(e) =>
                  updateField("status", e.target.value as BookingStatus)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {STATUS_VALUES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {submitting && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {mode === "create" ? "Simpan Tempahan" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
