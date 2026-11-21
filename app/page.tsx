"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  computeSummaryStats,
  filterTempahan,
  getTodayDateKey,
  type BookingStatus,
  type TempahanFilters,
  type TempahanRecord,
} from "@/lib/booking";
import {
  BookingFormModal,
  type BookingFormValues,
} from "@/components/BookingFormModal";
import { BookingTable } from "@/components/BookingTable";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { FilterBar } from "@/components/FilterBar";
import { SummaryCards } from "@/components/SummaryCards";
import { ToastViewport, type ToastItem } from "@/components/ToastViewport";

const INITIAL_FILTERS: TempahanFilters = {
  category: "Semua",
  item: "Semua",
  status: "Semua",
  search: "",
};

export default function HomePage() {
  const [bookings, setBookings] = useState<TempahanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TempahanFilters>(INITIAL_FILTERS);
  const [todayKey] = useState<string>(() => getTodayDateKey());

  // Modal & mutation states
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRecord, setEditingRecord] = useState<TempahanRecord | null>(
    null
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string>
  >({});

  const [deletingRecord, setDeletingRecord] = useState<TempahanRecord | null>(
    null
  );
  const [deleting, setDeleting] = useState<boolean>(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback(
    (type: "success" | "error", message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tempahan", { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (payload && typeof payload.error === "string" && payload.error) ||
            "Gagal mendapatkan data tempahan."
        );
      }
      setBookings(Array.isArray(payload) ? payload : []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ralat rangkaian semasa memuatkan tempahan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tempahan", { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (payload && typeof payload.error === "string" && payload.error) ||
              "Gagal mendapatkan data tempahan."
          );
        }
        return Array.isArray(payload) ? payload : [];
      })
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Ralat rangkaian semasa memuatkan tempahan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summaryStats = useMemo(
    () => computeSummaryStats(bookings, todayKey),
    [bookings, todayKey]
  );

  const filteredBookings = useMemo(
    () => filterTempahan(bookings, filters),
    [bookings, filters]
  );

  const openCreateModal = () => {
    setFormMode("create");
    setEditingRecord(null);
    setServerFieldErrors({});
    setFormOpen(true);
  };

  const openEditModal = (record: TempahanRecord) => {
    setFormMode("edit");
    setEditingRecord(record);
    setServerFieldErrors({});
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    setServerFieldErrors({});

    try {
      if (formMode === "create") {
        const res = await fetch("/api/tempahan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_pemohon: values.nama_pemohon,
            item_tempahan: values.item_tempahan,
            tarikh: values.tarikh,
            slot_masa: values.slot_masa,
          }),
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          if (payload?.fieldErrors) {
            setServerFieldErrors(payload.fieldErrors);
          }
          throw new Error(payload?.error || "Gagal menambah tempahan baharu.");
        }
        setBookings((prev) => [payload as TempahanRecord, ...prev]);
        setFormOpen(false);
        pushToast(
          "success",
          `Tempahan untuk ${values.nama_pemohon} berjaya didaftarkan.`
        );
      } else if (editingRecord) {
        const res = await fetch(`/api/tempahan/${editingRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_pemohon: values.nama_pemohon,
            item_tempahan: values.item_tempahan,
            tarikh: values.tarikh,
            slot_masa: values.slot_masa,
            status: values.status,
          }),
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          if (payload?.fieldErrors) {
            setServerFieldErrors(payload.fieldErrors);
          }
          throw new Error(payload?.error || "Gagal mengemas kini tempahan.");
        }
        const updated = payload as TempahanRecord;
        setBookings((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setFormOpen(false);
        setEditingRecord(null);
        pushToast(
          "success",
          `Rekod #${String(updated.id).padStart(3, "0")} berjaya dikemas kini.`
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Berlaku ralat semasa menyimpan.";
      pushToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (
    record: TempahanRecord,
    nextStatus: BookingStatus
  ) => {
    setMutatingId(record.id);
    try {
      const res = await fetch(`/api/tempahan/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal mengemas kini status.");
      }
      const updated = payload as TempahanRecord;
      setBookings((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast(
        "success",
        nextStatus === "Diluluskan"
          ? `Tempahan ${record.nama_pemohon} telah diluluskan.`
          : `Tempahan ${record.nama_pemohon} telah ditolak.`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menukar status tempahan.";
      pushToast("error", message);
    } finally {
      setMutatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tempahan/${deletingRecord.id}`, {
        method: "DELETE",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal memadam rekod tempahan.");
      }
      const removedId = deletingRecord.id;
      const removedName = deletingRecord.nama_pemohon;
      setBookings((prev) => prev.filter((item) => item.id !== removedId));
      setDeletingRecord(null);
      pushToast("success", `Rekod tempahan ${removedName} telah dipadam.`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memadam rekod tempahan.";
      pushToast("error", message);
    } finally {
      setDeleting(false);
    }
  };

  const activeNavKey = useMemo(() => {
    if (
      filters.category === "Ruang" &&
      filters.item === "Semua" &&
      filters.status === "Semua"
    ) {
      return "ruang";
    }
    if (
      filters.category === "Peralatan" &&
      filters.item === "Semua" &&
      filters.status === "Semua"
    ) {
      return "peralatan";
    }
    if (filters.status === "Menunggu" && filters.category === "Semua") {
      return "menunggu";
    }
    if (
      filters.category === "Semua" &&
      filters.item === "Semua" &&
      filters.status === "Semua"
    ) {
      return "semua";
    }
    return "custom";
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6 lg:px-8">
          <a
            href="#utama"
            onClick={(e) => {
              e.preventDefault();
              setFilters(INITIAL_FILTERS);
            }}
            className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Resource Booking System
          </a>

          <nav
            aria-label="Paparan pantas tempahan"
            className="hidden items-center gap-6 text-sm font-medium md:flex"
          >
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className={`whitespace-nowrap shrink-0 border-b-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                activeNavKey === "semua"
                  ? "border-blue-700 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua Rekod
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters({ ...INITIAL_FILTERS, category: "Ruang" })
              }
              className={`whitespace-nowrap shrink-0 border-b-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                activeNavKey === "ruang"
                  ? "border-blue-700 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Ruang
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters({ ...INITIAL_FILTERS, category: "Peralatan" })
              }
              className={`whitespace-nowrap shrink-0 border-b-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                activeNavKey === "peralatan"
                  ? "border-blue-700 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Peralatan
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters({ ...INITIAL_FILTERS, status: "Menunggu" })
              }
              className={`whitespace-nowrap shrink-0 border-b-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                activeNavKey === "menunggu"
                  ? "border-blue-700 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Menunggu
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-800 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tempahan Baru
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main
        id="utama"
        className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
            Sistem Tempahan Ruang &amp; Peralatan
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Urus permohonan bilik perbincangan, makmal komputer, dan pinjaman
            peralatan studio atau sukan kampus secara masa nyata.
          </p>
        </div>

        <SummaryCards
          stats={summaryStats}
          todayKey={todayKey}
          loading={loading}
          onSelectPendingFilter={() =>
            setFilters((prev) => ({
              ...prev,
              status: "Menunggu",
            }))
          }
        />

        <FilterBar
          filters={filters}
          totalCount={bookings.length}
          filteredCount={filteredBookings.length}
          onChange={setFilters}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />

        <BookingTable
          records={filteredBookings}
          totalRecords={bookings.length}
          todayKey={todayKey}
          loading={loading}
          error={error}
          mutatingId={mutatingId}
          onRetry={fetchBookings}
          onOpenCreate={openCreateModal}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
          onQuickStatus={handleQuickStatus}
          onEdit={openEditModal}
          onDelete={(record) => setDeletingRecord(record)}
        />
      </main>

      <BookingFormModal
        open={formOpen}
        mode={formMode}
        initialRecord={editingRecord}
        submitting={submitting}
        serverFieldErrors={serverFieldErrors}
        onClose={() => {
          if (!submitting) {
            setFormOpen(false);
            setEditingRecord(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        record={deletingRecord}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) setDeletingRecord(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
