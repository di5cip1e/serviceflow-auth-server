import { PrismaClient } from "@prisma/client";
import { presetChores } from "../src/data/presetChores";

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let skipped = 0;

  for (const chore of presetChores) {
    const existing = await prisma.chore.findFirst({
      where: { name: chore.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.chore.create({
      data: {
        name: chore.name,
        description: chore.description,
        difficulty_rating: chore.difficulty_rating,
        steps: {
          create: chore.steps.map((text, index) => ({
            text,
            sequence_order: index,
          })),
        },
      },
    });
    created++;
  }

  console.log(`Seeded ${created} preset chores (${skipped} already existed)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
