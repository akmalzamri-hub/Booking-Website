import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreatePayload } from "@/lib/booking";

export const dynamic = "force-dynamic";

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sambungan pangkalan data belum dikonfigurasi. Sila tetapkan pemboleh ubah persekitaran DATABASE_URL.",
      },
      { status: 503 }
    );
  }

  try {
    const tempahan = await prisma.tempahan.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(tempahan, { status: 200 });
  } catch (error) {
    console.error("GET /api/tempahan error:", error);
    return NextResponse.json(
      { error: "Gagal memuatkan senarai tempahan daripada pangkalan data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sambungan pangkalan data belum dikonfigurasi. Sila tetapkan pemboleh ubah persekitaran DATABASE_URL.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Format JSON dalam permintaan tidak sah." },
      { status: 400 }
    );
  }

  const validation = validateCreatePayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.message, fieldErrors: validation.errors },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.tempahan.create({
      data: {
        nama_pemohon: validation.data.nama_pemohon,
        item_tempahan: validation.data.item_tempahan,
        tarikh: validation.data.tarikh,
        slot_masa: validation.data.slot_masa,
        status: validation.data.status,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/tempahan error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tempahan baharu ke pangkalan data." },
      { status: 500 }
    );
  }
}
