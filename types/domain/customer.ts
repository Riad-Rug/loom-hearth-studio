export type CustomerRole = "customer";

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
};

export type AdminRole = "admin" | "editor" | "viewer";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};
