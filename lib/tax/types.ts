import type { Cart } from "@/types/domain";

export type TaxQuote = {
  amountUsd: number;
  jurisdiction?: string;
};

export interface TaxService {
  quote(cart: Cart): Promise<TaxQuote>;
}

export const taxServiceTodo =
  "TODO: Validate the tax handling model before calculating checkout totals beyond the placeholder shape.";
