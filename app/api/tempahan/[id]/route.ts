import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateUpdatePayload } from "@/lib/booking";

export const dynamic = "force-dynamic";

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

function parseNumericId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const parsed = Number(rawId);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = parseNumericId(id);
  if (numericId === null) {
    return NextResponse.json(
      { error: "ID tempahan tidak sah." },
      { status: 400 }
    );
  }

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

  const validation = validateUpdatePayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.message, fieldErrors: validation.errors },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.tempahan.update({
      where: { id: numericId },
      data: validation.data,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod tempahan tidak ditemui." },
        { status: 404 }
      );
    }
    console.error("PATCH /api/tempahan/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengemas kini rekod tempahan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = parseNumericId(id);
  if (numericId === null) {
    return NextResponse.json(
      { error: "ID tempahan tidak sah." },
      { status: 400 }
    );
  }

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
    await prisma.tempahan.delete({
      where: { id: numericId },
    });
    return NextResponse.json({ deleted: true, id: numericId }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Rekod tempahan tidak ditemui." },
        { status: 404 }
      );
    }
    console.error("DELETE /api/tempahan/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memadam rekod tempahan." },
      { status: 500 }
    );
  }
}
