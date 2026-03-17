import { getEnvSnapshot } from "@/lib/validation/env";

export type DatabaseProvider = "postgresql";
export type DatabaseMissingConfig = "DATABASE_URL";
export type DatabaseConfig = {
  provider: DatabaseProvider;
  url?: string;
  status: "missing-config" | "ready";
  missingConfig: DatabaseMissingConfig[];
};

export function getDatabaseConfig(): DatabaseConfig {
  const env = getEnvSnapshot();
  const missingConfig: DatabaseMissingConfig[] = env.DATABASE_URL
    ? []
    : ["DATABASE_URL"];

  return {
    provider: "postgresql",
    url: env.DATABASE_URL,
    status: missingConfig.length ? "missing-config" : "ready",
    missingConfig,
  };
}

export function hasDatabaseConfig() {
  return getDatabaseConfig().status === "ready";
}

export const databaseConfigTodo =
  "TODO: Keep PostgreSQL as the launch database and Prisma as the query layer while repository implementations are introduced.";
