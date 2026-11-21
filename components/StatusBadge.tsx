"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "Diluluskan") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        Diluluskan
      </span>
    );
  }

  if (status === "Ditolak") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
        <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
        Ditolak
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"
      )}
    >
      <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
      Menunggu
    </span>
  );
}
