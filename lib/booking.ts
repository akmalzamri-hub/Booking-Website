export const RUANG_ITEMS = [
  "Bilik Perbincangan 1",
  "Bilik Perbincangan 2",
  "Makmal Komputer 1",
  "Makmal Komputer 2",
] as const;

export const PERALATAN_ITEMS = [
  "Kamera DSLR",
  "Tripod",
  "Bola Futsal",
  "Raket Badminton",
] as const;

export const ALL_ITEMS = [...RUANG_ITEMS, ...PERALATAN_ITEMS] as const;

export const TIME_SLOTS = [
  "8:00-10:00",
  "10:00-12:00",
  "14:00-16:00",
  "16:00-18:00",
] as const;

export const STATUS_VALUES = [
  "Menunggu",
  "Diluluskan",
  "Ditolak",
] as const;

export type BookingItem = (typeof ALL_ITEMS)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];
export type BookingStatus = (typeof STATUS_VALUES)[number];
export type BookingCategory = "Ruang" | "Peralatan";

export interface TempahanRecord {
  id: number;
  nama_pemohon: string;
  item_tempahan: string;
  tarikh: string;
  slot_masa: string;
  status: string;
  createdAt: string;
}

export interface TempahanFilters {
  category: "Semua" | BookingCategory;
  item: string;
  status: "Semua" | BookingStatus;
  search: string;
}

export interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

export interface ValidationFailure {
  ok: false;
  message: string;
  errors: Record<string, string>;
}

export function getItemCategory(item: string): BookingCategory {
  return (RUANG_ITEMS as readonly string[]).includes(item)
    ? "Ruang"
    : "Peralatan";
}

export function getItemsForCategory(
  category: "Semua" | BookingCategory
): readonly string[] {
  if (category === "Ruang") return RUANG_ITEMS;
  if (category === "Peralatan") return PERALATAN_ITEMS;
  return ALL_ITEMS;
}

export function getTodayDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateKey(dateOrIso: Date | string): string {
  if (dateOrIso instanceof Date) {
    if (Number.isNaN(dateOrIso.getTime())) return "";
    return dateOrIso.toISOString().slice(0, 10);
  }
  const trimmed = String(dateOrIso).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function parseTarikhInput(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    if (
      dt.getUTCFullYear() !== year ||
      dt.getUTCMonth() !== month - 1 ||
      dt.getUTCDate() !== day
    ) {
      return null;
    }
    return dt;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

export interface CreateTempahanData {
  nama_pemohon: string;
  item_tempahan: BookingItem;
  tarikh: Date;
  slot_masa: TimeSlot;
  status: BookingStatus;
}

export function validateCreatePayload(
  input: unknown
): ValidationSuccess<CreateTempahanData> | ValidationFailure {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      message: "Data tempahan tidak sah.",
      errors: { form: "Format payload JSON tidak sah." },
    };
  }

  const record = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const rawNama =
    typeof record.nama_pemohon === "string" ? record.nama_pemohon.trim() : "";
  if (!rawNama) {
    errors.nama_pemohon = "Nama pemohon wajib diisi.";
  } else if (rawNama.length < 2) {
    errors.nama_pemohon = "Nama pemohon mestilah sekurang-kurangnya 2 aksara.";
  } else if (rawNama.length > 120) {
    errors.nama_pemohon = "Nama pemohon tidak boleh melebihi 120 aksara.";
  }

  const rawItem =
    typeof record.item_tempahan === "string" ? record.item_tempahan.trim() : "";
  if (!(ALL_ITEMS as readonly string[]).includes(rawItem)) {
    errors.item_tempahan = "Sila pilih ruang atau peralatan yang sah.";
  }

  const parsedTarikh = parseTarikhInput(record.tarikh);
  if (!parsedTarikh) {
    errors.tarikh = "Sila masukkan tarikh tempahan yang sah.";
  }

  const rawSlot =
    typeof record.slot_masa === "string" ? record.slot_masa.trim() : "";
  if (!(TIME_SLOTS as readonly string[]).includes(rawSlot)) {
    errors.slot_masa = "Sila pilih slot masa yang sah.";
  }

  let status: BookingStatus = "Menunggu";
  if (record.status !== undefined && record.status !== null && record.status !== "") {
    const rawStatus =
      typeof record.status === "string" ? record.status.trim() : "";
    if (!(STATUS_VALUES as readonly string[]).includes(rawStatus)) {
      errors.status = "Status tempahan tidak sah.";
    } else {
      status = rawStatus as BookingStatus;
    }
  }

  if (Object.keys(errors).length > 0 || !parsedTarikh) {
    return {
      ok: false,
      message: Object.values(errors)[0] ?? "Maklumat tempahan tidak lengkap.",
      errors,
    };
  }

  return {
    ok: true,
    data: {
      nama_pemohon: rawNama,
      item_tempahan: rawItem as BookingItem,
      tarikh: parsedTarikh,
      slot_masa: rawSlot as TimeSlot,
      status,
    },
  };
}

export interface UpdateTempahanData {
  nama_pemohon?: string;
  item_tempahan?: BookingItem;
  tarikh?: Date;
  slot_masa?: TimeSlot;
  status?: BookingStatus;
}

export function validateUpdatePayload(
  input: unknown
): ValidationSuccess<UpdateTempahanData> | ValidationFailure {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      message: "Data kemas kini tidak sah.",
      errors: { form: "Format payload JSON tidak sah." },
    };
  }

  const record = input as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const data: UpdateTempahanData = {};

  if (record.nama_pemohon !== undefined) {
    const rawNama =
      typeof record.nama_pemohon === "string" ? record.nama_pemohon.trim() : "";
    if (!rawNama) {
      errors.nama_pemohon = "Nama pemohon wajib diisi.";
    } else if (rawNama.length < 2) {
      errors.nama_pemohon = "Nama pemohon mestilah sekurang-kurangnya 2 aksara.";
    } else if (rawNama.length > 120) {
      errors.nama_pemohon = "Nama pemohon tidak boleh melebihi 120 aksara.";
    } else {
      data.nama_pemohon = rawNama;
    }
  }

  if (record.item_tempahan !== undefined) {
    const rawItem =
      typeof record.item_tempahan === "string" ? record.item_tempahan.trim() : "";
    if (!(ALL_ITEMS as readonly string[]).includes(rawItem)) {
      errors.item_tempahan = "Item tempahan tidak sah.";
    } else {
      data.item_tempahan = rawItem as BookingItem;
    }
  }

  if (record.tarikh !== undefined) {
    const parsedTarikh = parseTarikhInput(record.tarikh);
    if (!parsedTarikh) {
      errors.tarikh = "Tarikh tempahan tidak sah.";
    } else {
      data.tarikh = parsedTarikh;
    }
  }

  if (record.slot_masa !== undefined) {
    const rawSlot =
      typeof record.slot_masa === "string" ? record.slot_masa.trim() : "";
    if (!(TIME_SLOTS as readonly string[]).includes(rawSlot)) {
      errors.slot_masa = "Slot masa tidak sah.";
    } else {
      data.slot_masa = rawSlot as TimeSlot;
    }
  }

  if (record.status !== undefined) {
    const rawStatus =
      typeof record.status === "string" ? record.status.trim() : "";
    if (!(STATUS_VALUES as readonly string[]).includes(rawStatus)) {
      errors.status = "Status mestilah Menunggu, Diluluskan, atau Ditolak.";
    } else {
      data.status = rawStatus as BookingStatus;
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: Object.values(errors)[0] ?? "Input kemas kini tidak sah.",
      errors,
    };
  }

  if (Object.keys(data).length === 0) {
    return {
      ok: false,
      message: "Tiada medan untuk dikemas kini.",
      errors: { form: "Sekurang-kurangnya satu medan diperlukan." },
    };
  }

  return { ok: true, data };
}

export interface SummaryStats {
  todayCount: number;
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

export function computeSummaryStats(
  records: TempahanRecord[],
  todayKey: string = getTodayDateKey()
): SummaryStats {
  let todayCount = 0;
  let pendingCount = 0;
  let approvedCount = 0;

  for (const r of records) {
    if (formatDateKey(r.tarikh) === todayKey) {
      todayCount += 1;
    }
    if (r.status === "Menunggu") {
      pendingCount += 1;
    } else if (r.status === "Diluluskan") {
      approvedCount += 1;
    }
  }

  return {
    todayCount,
    pendingCount,
    approvedCount,
    totalCount: records.length,
  };
}

export function filterTempahan(
  records: TempahanRecord[],
  filters: TempahanFilters
): TempahanRecord[] {
  const searchLower = filters.search.trim().toLowerCase();

  return records.filter((record) => {
    if (
      filters.category !== "Semua" &&
      getItemCategory(record.item_tempahan) !== filters.category
    ) {
      return false;
    }

    if (filters.item !== "Semua" && record.item_tempahan !== filters.item) {
      return false;
    }

    if (filters.status !== "Semua" && record.status !== filters.status) {
      return false;
    }

    if (searchLower) {
      const matchesName = record.nama_pemohon
        .toLowerCase()
        .includes(searchLower);
      const matchesItem = record.item_tempahan
        .toLowerCase()
        .includes(searchLower);
      const matchesId = String(record.id).includes(searchLower);
      if (!matchesName && !matchesItem && !matchesId) {
        return false;
      }
    }

    return true;
  });
}

export function formatDisplayDate(dateOrIso: Date | string): string {
  const key = formatDateKey(dateOrIso);
  if (!key) return "-";
  const [year, month, day] = key.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mac",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ogo",
    "Sep",
    "Okt",
    "Nov",
    "Dis",
  ];
  return `${day} ${months[month - 1]} ${year}`;
}
