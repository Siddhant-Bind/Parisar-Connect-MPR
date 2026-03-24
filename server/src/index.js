import dotenv from "dotenv";
import { app } from "./app.js";
import prisma from "./db/prisma.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`⚙️ Server is running at port : ${port}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────
// When Nodemon kills the process (SIGINT / SIGTERM), disconnect Prisma
// so PostgreSQL releases all prepared statements and connections cleanly.

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("   HTTP server closed.");
    await prisma.$disconnect();
    console.log("   Prisma disconnected.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
