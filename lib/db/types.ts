import type { PrismaClient } from "@prisma/client";

export type DatabaseClient = PrismaClient;

export interface RepositoryContext {
  client: DatabaseClient;
}

export const repositoryContextTodo =
  "TODO: Keep repository implementations behind this Prisma-backed context until concrete repositories are introduced.";
