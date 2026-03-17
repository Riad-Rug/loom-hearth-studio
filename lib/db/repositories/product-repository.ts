import { launchProducts } from "@/lib/catalog/launch-product-data";
import type { Product } from "@/types/domain";

export interface ProductRepository {
  listAll(): Promise<Product[]>;
  listByCategory(category: Product["category"]): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
}

export class LaunchProductRepository implements ProductRepository {
  async listAll() {
    return launchProducts.filter((product) => product.status === "active");
  }

  async listByCategory(category: Product["category"]) {
    const products = await this.listAll();

    return products.filter((product) => product.category === category);
  }

  async getBySlug(slug: string) {
    const products = await this.listAll();

    return products.find((product) => product.slug === slug) ?? null;
  }
}

export function createProductRepository() {
  return new LaunchProductRepository();
}

export const productRepositoryTodo =
  "TODO: Replace the in-repo launch catalog repository with a broader persisted product source only after the product stack decision is finalized.";
