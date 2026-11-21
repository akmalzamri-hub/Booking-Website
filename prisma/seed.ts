import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function utcDateOffset(daysOffset: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysOffset,
      0,
      0,
      0,
      0
    )
  );
}

async function main() {
  await prisma.tempahan.deleteMany();

  await prisma.tempahan.createMany({
    data: [
      {
        nama_pemohon: "Ahmad Danial Hakim",
        item_tempahan: "Makmal Komputer 1",
        tarikh: utcDateOffset(0),
        slot_masa: "8:00-10:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Nurul Aina Syafiqah",
        item_tempahan: "Kamera DSLR",
        tarikh: utcDateOffset(0),
        slot_masa: "10:00-12:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Muhammad Irfan Zulkifli",
        item_tempahan: "Bilik Perbincangan 1",
        tarikh: utcDateOffset(0),
        slot_masa: "14:00-16:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Tan Wei Ming",
        item_tempahan: "Bola Futsal",
        tarikh: utcDateOffset(0),
        slot_masa: "16:00-18:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Kavitha a/p Subramaniam",
        item_tempahan: "Bilik Perbincangan 2",
        tarikh: utcDateOffset(1),
        slot_masa: "10:00-12:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Siti Nurhaliza binti Roslan",
        item_tempahan: "Tripod",
        tarikh: utcDateOffset(1),
        slot_masa: "14:00-16:00",
        status: "Diluluskan",
      },
      {
        nama_pemohon: "Amirul Haziq bin Azman",
        item_tempahan: "Makmal Komputer 2",
        tarikh: utcDateOffset(2),
        slot_masa: "8:00-10:00",
        status: "Menunggu",
      },
      {
        nama_pemohon: "Farah Nadia binti Kamal",
        item_tempahan: "Raket Badminton",
        tarikh: utcDateOffset(-1),
        slot_masa: "16:00-18:00",
        status: "Ditolak",
      },
      {
        nama_pemohon: "Harith Iskandar bin Razak",
        item_tempahan: "Kamera DSLR",
        tarikh: utcDateOffset(-2),
        slot_masa: "8:00-10:00",
        status: "Diluluskan",
      },
    ],
  });

  console.log("Berjaya menyemai 9 rekod tempahan kampus.");
}

main()
  .catch((error) => {
    console.error("Ralat semasa menyemai data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
