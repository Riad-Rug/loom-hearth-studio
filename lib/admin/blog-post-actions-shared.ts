export type AdminBlogPostActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<string, string>>;
};

export const initialAdminBlogPostActionState: AdminBlogPostActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
