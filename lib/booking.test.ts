import test from "node:test";
import assert from "node:assert/strict";
import {
  computeSummaryStats,
  filterTempahan,
  formatDateKey,
  formatDisplayDate,
  getItemCategory,
  validateCreatePayload,
  validateUpdatePayload,
  type TempahanRecord,
} from "./booking";

const SAMPLE_RECORDS: TempahanRecord[] = [
  {
    id: 1,
    nama_pemohon: "Ahmad Danial",
    item_tempahan: "Makmal Komputer 1",
    tarikh: "2026-11-21T00:00:00.000Z",
    slot_masa: "8:00-10:00",
    status: "Menunggu",
    createdAt: "2026-11-21T01:00:00.000Z",
  },
  {
    id: 2,
    nama_pemohon: "Nurul Aina",
    item_tempahan: "Kamera DSLR",
    tarikh: "2026-11-21T00:00:00.000Z",
    slot_masa: "10:00-12:00",
    status: "Diluluskan",
    createdAt: "2026-11-21T01:30:00.000Z",
  },
  {
    id: 3,
    nama_pemohon: "Tan Wei Ming",
    item_tempahan: "Bilik Perbincangan 2",
    tarikh: "2026-11-22T00:00:00.000Z",
    slot_masa: "14:00-16:00",
    status: "Menunggu",
    createdAt: "2026-11-20T08:00:00.000Z",
  },
  {
    id: 4,
    nama_pemohon: "Kavitha Subramaniam",
    item_tempahan: "Bola Futsal",
    tarikh: "2026-11-20T00:00:00.000Z",
    slot_masa: "16:00-18:00",
    status: "Ditolak",
    createdAt: "2026-11-19T12:00:00.000Z",
  },
];

test("getItemCategory classifies Ruang and Peralatan items accurately", () => {
  assert.equal(getItemCategory("Bilik Perbincangan 1"), "Ruang");
  assert.equal(getItemCategory("Makmal Komputer 2"), "Ruang");
  assert.equal(getItemCategory("Kamera DSLR"), "Peralatan");
  assert.equal(getItemCategory("Raket Badminton"), "Peralatan");
});

test("validateCreatePayload validates required fields and rejects invalid inputs", () => {
  const emptyResult = validateCreatePayload({});
  assert.equal(emptyResult.ok, false);
  if (!emptyResult.ok) {
    assert.ok(emptyResult.errors.nama_pemohon);
    assert.ok(emptyResult.errors.item_tempahan);
    assert.ok(emptyResult.errors.tarikh);
    assert.ok(emptyResult.errors.slot_masa);
  }

  const invalidItem = validateCreatePayload({
    nama_pemohon: "Siti Aminah",
    item_tempahan: "Dewan Kuliah",
    tarikh: "2026-11-21",
    slot_masa: "8:00-10:00",
  });
  assert.equal(invalidItem.ok, false);

  const valid = validateCreatePayload({
    nama_pemohon: "  Muhammad Irfan  ",
    item_tempahan: "Tripod",
    tarikh: "2026-11-21",
    slot_masa: "10:00-12:00",
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.nama_pemohon, "Muhammad Irfan");
    assert.equal(valid.data.status, "Menunggu");
    assert.equal(formatDateKey(valid.data.tarikh), "2026-11-21");
  }
});

test("validateUpdatePayload allows single-field status transitions and rejects bad status", () => {
  const approve = validateUpdatePayload({ status: "Diluluskan" });
  assert.equal(approve.ok, true);
  if (approve.ok) {
    assert.equal(approve.data.status, "Diluluskan");
  }

  const badStatus = validateUpdatePayload({ status: "Batal" });
  assert.equal(badStatus.ok, false);

  const emptyUpdate = validateUpdatePayload({});
  assert.equal(emptyUpdate.ok, false);
});

test("computeSummaryStats counts today bookings and pending records accurately", () => {
  const stats = computeSummaryStats(SAMPLE_RECORDS, "2026-11-21");
  assert.equal(stats.todayCount, 2);
  assert.equal(stats.pendingCount, 2);
  assert.equal(stats.approvedCount, 1);
  assert.equal(stats.totalCount, 4);
});

test("filterTempahan filters by category, specific item, status, and search", () => {
  const ruangOnly = filterTempahan(SAMPLE_RECORDS, {
    category: "Ruang",
    item: "Semua",
    status: "Semua",
    search: "",
  });
  assert.deepEqual(
    ruangOnly.map((r) => r.id),
    [1, 3]
  );

  const dslrOnly = filterTempahan(SAMPLE_RECORDS, {
    category: "Peralatan",
    item: "Kamera DSLR",
    status: "Semua",
    search: "",
  });
  assert.deepEqual(
    dslrOnly.map((r) => r.id),
    [2]
  );

  const pendingSearch = filterTempahan(SAMPLE_RECORDS, {
    category: "Semua",
    item: "Semua",
    status: "Menunggu",
    search: "tan wei",
  });
  assert.deepEqual(
    pendingSearch.map((r) => r.id),
    [3]
  );
});

test("formatDisplayDate renders readable Malaysian short dates", () => {
  assert.equal(formatDisplayDate("2026-11-21T00:00:00.000Z"), "21 Nov 2026");
  assert.equal(formatDisplayDate("2026-05-03T00:00:00.000Z"), "3 Mei 2026");
});
