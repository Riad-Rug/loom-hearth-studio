import type { RepositoryContext } from "@/lib/db/types";
import { db } from "@/lib/db/client";

export function createRepositoryContext(client = db): RepositoryContext {
  return {
    client,
  };
}

export const repositoryContextFactoryTodo =
  "TODO: Expand repository context construction only when concrete repositories or transactions require additional wiring.";
