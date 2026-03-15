import type { Product } from "@/types/domain";

export interface ProductRepository {
  listByCategory(category: Product["category"]): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
}

export const productRepositoryTodo =
  "TODO: Implement ProductRepository after validating database and ORM choices.";
