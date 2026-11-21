"use client";

import {
  AlertTriangle,
  Building2,
  CalendarPlus,
  Check,
  Loader2,
  Package,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  formatDateKey,
  formatDisplayDate,
  getItemCategory,
  type BookingStatus,
  type TempahanRecord,
} from "@/lib/booking";
import { StatusBadge } from "./StatusBadge";

interface BookingTableProps {
  records: TempahanRecord[];
  totalRecords: number;
  todayKey: string;
  loading: boolean;
  error: string | null;
  mutatingId: number | null;
  onRetry: () => void;
  onOpenCreate: () => void;
  onResetFilters: () => void;
  onQuickStatus: (record: TempahanRecord, status: BookingStatus) => void;
  onEdit: (record: TempahanRecord) => void;
  onDelete: (record: TempahanRecord) => void;
}

export function BookingTable({
  records,
  totalRecords,
  todayKey,
  loading,
  error,
  mutatingId,
  onRetry,
  onOpenCreate,
  onResetFilters,
  onQuickStatus,
  onEdit,
  onDelete,
}: BookingTableProps) {
  if (loading) {
    return (
      <div
        aria-label="Memuatkan senarai tempahan"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-36 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-white p-8 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">
          Gagal Memuatkan Data Tempahan
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          {error}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Cuba Semula
          </button>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    const isFilteredEmpty = totalRecords > 0;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
          <CalendarPlus className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">
          {isFilteredEmpty
            ? "Tiada Rekod Sepadan Dengan Penapis"
            : "Belum Ada Rekod Tempahan"}
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          {isFilteredEmpty
            ? "Cuba tukar kategori, item spesifik, atau kata carian untuk melihat tempahan lain."
            : "Semua tempahan ruang dan peralatan kampus akan dipaparkan di sini selepas ditambah."}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {isFilteredEmpty ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Set Semula Penapis
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Tambah Tempahan Pertama
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Data Table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                <th scope="col" className="py-3 pl-5 pr-3">
                  ID
                </th>
                <th scope="col" className="px-3 py-3">
                  Nama Pemohon
                </th>
                <th scope="col" className="px-3 py-3">
                  Item Tempahan
                </th>
                <th scope="col" className="px-3 py-3">
                  Tarikh &amp; Slot Masa
                </th>
                <th scope="col" className="px-3 py-3">
                  Status
                </th>
                <th scope="col" className="py-3 pl-3 pr-5 text-right">
                  Tindakan Admin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((row) => {
                const category = getItemCategory(row.item_tempahan);
                const dateKey = formatDateKey(row.tarikh);
                const isToday = dateKey === todayKey;
                const isMutating = mutatingId === row.id;

                return (
                  <tr
                    key={row.id}
                    data-testid={`booking-row-${row.id}`}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="py-3.5 pl-5 pr-3 align-middle font-mono text-xs font-medium text-slate-500 tabular-nums">
                      #{String(row.id).padStart(3, "0")}
                    </td>

                    <td className="px-3 py-3.5 align-middle">
                      <p className="font-medium text-slate-900">
                        {row.nama_pemohon}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {category} · Ditempah{" "}
                        <span className="font-mono tabular-nums">
                          {formatDisplayDate(row.createdAt)}
                        </span>
                      </p>
                    </td>

                    <td className="px-3 py-3.5 align-middle">
                      <div className="flex items-center gap-2 text-slate-800">
                        {category === "Ruang" ? (
                          <Building2
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Package
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        )}
                        <span className="font-medium">{row.item_tempahan}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <span className="font-medium tabular-nums">
                          {formatDisplayDate(row.tarikh)}
                        </span>
                        {isToday && (
                          <span className="text-xs font-semibold text-blue-700">
                            · Hari Ini
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
                        {row.slot_masa}
                      </p>
                    </td>

                    <td className="px-3 py-3.5 align-middle">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="py-3.5 pl-3 pr-5 align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isMutating || row.status === "Diluluskan"}
                          onClick={() => onQuickStatus(row, "Diluluskan")}
                          aria-label={`Luluskan tempahan ${row.nama_pemohon}`}
                          className="inline-flex h-8 items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                        >
                          {isMutating ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          Lulus
                        </button>

                        <button
                          type="button"
                          disabled={isMutating || row.status === "Ditolak"}
                          onClick={() => onQuickStatus(row, "Ditolak")}
                          aria-label={`Tolak tempahan ${row.nama_pemohon}`}
                          className="inline-flex h-8 items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          Tolak
                        </button>

                        <span
                          className="mx-0.5 h-4 w-px bg-slate-200"
                          aria-hidden="true"
                        />

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => onEdit(row)}
                          aria-label={`Edit tempahan ${row.nama_pemohon}`}
                          className="inline-flex h-8 items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => onDelete(row)}
                          aria-label={`Padam tempahan ${row.nama_pemohon}`}
                          className="inline-flex h-8 items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Padam
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="space-y-3 md:hidden">
        {records.map((row) => {
          const category = getItemCategory(row.item_tempahan);
          const isToday = formatDateKey(row.tarikh) === todayKey;
          const isMutating = mutatingId === row.id;

          return (
            <article
              key={row.id}
              data-testid={`booking-card-${row.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-medium tabular-nums">
                      #{String(row.id).padStart(3, "0")}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{category}</span>
                  </div>
                  <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                    {row.nama_pemohon}
                  </h3>
                </div>
                <StatusBadge status={row.status} />
              </div>

              <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{row.item_tempahan}</p>
                <p className="text-xs text-slate-600">
                  <span className="tabular-nums">
                    {formatDisplayDate(row.tarikh)}
                  </span>
                  {isToday && (
                    <span className="font-semibold text-blue-700">
                      {" "}
                      (Hari Ini)
                    </span>
                  )}{" "}
                  ·{" "}
                  <span className="font-mono tabular-nums">{row.slot_masa}</span>
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  disabled={isMutating || row.status === "Diluluskan"}
                  onClick={() => onQuickStatus(row, "Diluluskan")}
                  aria-label={`Luluskan tempahan ${row.nama_pemohon}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-45"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Lulus
                </button>
                <button
                  type="button"
                  disabled={isMutating || row.status === "Ditolak"}
                  onClick={() => onQuickStatus(row, "Ditolak")}
                  aria-label={`Tolak tempahan ${row.nama_pemohon}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-45"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Tolak
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => onEdit(row)}
                  aria-label={`Edit tempahan ${row.nama_pemohon}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => onDelete(row)}
                  aria-label={`Padam tempahan ${row.nama_pemohon}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Padam
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
