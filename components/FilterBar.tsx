"use client";

import { RotateCcw, Search } from "lucide-react";
import {
  PERALATAN_ITEMS,
  RUANG_ITEMS,
  STATUS_VALUES,
  type BookingCategory,
  type BookingStatus,
  type TempahanFilters,
} from "@/lib/booking";

interface FilterBarProps {
  filters: TempahanFilters;
  totalCount: number;
  filteredCount: number;
  onChange: (next: TempahanFilters) => void;
  onReset: () => void;
}

export function FilterBar({
  filters,
  totalCount,
  filteredCount,
  onChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilter =
    filters.category !== "Semua" ||
    filters.item !== "Semua" ||
    filters.status !== "Semua" ||
    filters.search.trim() !== "";

  const handleCategoryChange = (category: "Semua" | BookingCategory) => {
    // Clear specific item if it does not belong to the newly chosen category
    let nextItem = filters.item;
    if (
      category === "Ruang" &&
      nextItem !== "Semua" &&
      !(RUANG_ITEMS as readonly string[]).includes(nextItem)
    ) {
      nextItem = "Semua";
    }
    if (
      category === "Peralatan" &&
      nextItem !== "Semua" &&
      !(PERALATAN_ITEMS as readonly string[]).includes(nextItem)
    ) {
      nextItem = "Semua";
    }
    onChange({ ...filters, category, item: nextItem });
  };

  return (
    <section
      aria-label="Penapis Senarai Tempahan"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
        <div className="md:col-span-4">
          <label
            htmlFor="filter-search"
            className="mb-1.5 block text-xs font-medium text-slate-600"
          >
            Cari Pemohon atau Item
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="filter-search"
              type="search"
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              placeholder="Taip nama pemohon atau ID..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="filter-category"
            className="mb-1.5 block text-xs font-medium text-slate-600"
          >
            Jenis Item
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) =>
              handleCategoryChange(
                e.target.value as "Semua" | BookingCategory
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Semua">Semua Jenis</option>
            <option value="Ruang">Ruang</option>
            <option value="Peralatan">Peralatan</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="filter-item"
            className="mb-1.5 block text-xs font-medium text-slate-600"
          >
            Item Spesifik
          </label>
          <select
            id="filter-item"
            value={filters.item}
            onChange={(e) => onChange({ ...filters, item: e.target.value })}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Semua">Semua Item</option>
            {filters.category === "Semua" ? (
              <>
                <optgroup label="Ruang Kampus">
                  {RUANG_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Peralatan">
                  {PERALATAN_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              </>
            ) : filters.category === "Ruang" ? (
              RUANG_ITEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            ) : (
              PERALATAN_ITEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="md:col-span-3 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="filter-status"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) =>
                onChange({
                  ...filters,
                  status: e.target.value as "Semua" | BookingStatus,
                })
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="Semua">Semua Status</option>
              {STATUS_VALUES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Set Semula
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Menunjukkan{" "}
          <strong className="font-mono font-semibold text-slate-800 tabular-nums">
            {filteredCount}
          </strong>{" "}
          daripada{" "}
          <strong className="font-mono font-semibold text-slate-800 tabular-nums">
            {totalCount}
          </strong>{" "}
          rekod tempahan
        </span>
        {hasActiveFilter && (
          <span className="text-blue-700 font-medium">Penapis aktif</span>
        )}
      </div>
    </section>
  );
}
