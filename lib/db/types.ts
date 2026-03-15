export type DatabaseClient = unknown;

export interface RepositoryContext {
  // TODO: Validate database and ORM before replacing the placeholder client type.
  client: DatabaseClient;
}
