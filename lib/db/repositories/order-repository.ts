import type { Order } from "@/types/domain";

export interface OrderRepository {
  create(order: Order): Promise<Order>;
  getById(orderId: string): Promise<Order | null>;
  updateStatus(orderId: string, status: Order["status"]): Promise<Order>;
}

export const orderRepositoryTodo =
  "TODO: Implement OrderRepository after validating database and ORM choices.";
