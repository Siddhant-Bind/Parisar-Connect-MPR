import { PrismaClient } from "@prisma/client";

// ⚠️  WARNING: This script outputs PII (names, emails) to the console.
// Do NOT run in production or commit its output to version control.
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: {
      email: true,
      role: true,
      name: true,
      society: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
