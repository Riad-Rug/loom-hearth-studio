import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var loomHearthPrisma: PrismaClient | undefined;
}

export function createDatabaseClient() {
  return new PrismaClient();
}

export const db = globalThis.loomHearthPrisma ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.loomHearthPrisma = db;
}

export const databaseClientTodo =
  "TODO: Keep Prisma client lifecycle centralized here until concrete repositories are implemented.";
