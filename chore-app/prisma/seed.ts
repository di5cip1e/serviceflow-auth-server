import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const doers = ["Jacob", "Alexis", "Kevin", "Tristan", "Max", "Theo"];

async function main() {
  for (let i = 0; i < doers.length; i++) {
    await prisma.doer.upsert({
      where: { id: i + 1 },
      update: {},
      create: { name: doers[i] },
    });
  }
  console.log(`Seeded ${doers.length} doers: ${doers.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
