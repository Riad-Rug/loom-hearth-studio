export type AdminProductActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<string, string>>;
};

export const initialAdminProductActionState: AdminProductActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
