export type AdminHomepageActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialAdminHomepageActionState: AdminHomepageActionState = {
  status: "idle",
  message: null,
};
