"use client";

import { CalendarCheck, CheckSquare, Hourglass } from "lucide-react";
import { formatDisplayDate, type SummaryStats } from "@/lib/booking";

interface SummaryCardsProps {
  stats: SummaryStats;
  todayKey: string;
  loading: boolean;
  onSelectPendingFilter?: () => void;
}

export function SummaryCards({
  stats,
  todayKey,
  loading,
  onSelectPendingFilter,
}: SummaryCardsProps) {
  const formattedToday = formatDisplayDate(todayKey);

  return (
    <section
      aria-label="Ringkasan Tempahan"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <div
        data-testid="summary-today"
        className="rounded-xl border border-slate-200 bg-white p-5 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">
              Tempahan Hari Ini
            </p>
            {loading ? (
              <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {stats.todayCount}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Tarikh · <span className="font-mono tabular-nums">{formattedToday}</span>
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div
        data-testid="summary-pending"
        className="rounded-xl border border-slate-200 bg-white p-5 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">
              Permohonan Menunggu
            </p>
            {loading ? (
              <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {stats.pendingCount}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              {stats.pendingCount > 0 ? (
                <>
                  <span>Perlu semakan admin</span>
                  {onSelectPendingFilter && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={onSelectPendingFilter}
                        className="font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                      >
                        Tapis sekarang
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span>Semua permohonan telah disemak</span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
            <Hourglass className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div
        data-testid="summary-approved"
        className="rounded-xl border border-slate-200 bg-white p-5 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">
              Tempahan Diluluskan
            </p>
            {loading ? (
              <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-slate-100" />
            ) : (
              <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {stats.approvedCount}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Daripada{" "}
              <span className="font-mono font-medium text-slate-700 tabular-nums">
                {stats.totalCount}
              </span>{" "}
              jumlah rekod
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckSquare className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
