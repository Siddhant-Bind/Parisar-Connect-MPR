import { PrismaClient } from "@prisma/client";

// ── Singleton pattern ─────────────────────────────────────────────────
// Prevents multiple PrismaClient instances during Nodemon hot-reloads.
// Each instance opens its own DB connection and registers prepared
// statements (s0, s1, …). When a stale connection still holds those
// names, the new instance collides → PostgreSQL error 42P05.
// Storing the client on `globalThis` survives module-cache invalidation.

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
