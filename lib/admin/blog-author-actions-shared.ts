export type AdminBlogAuthorActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialAdminBlogAuthorActionState: AdminBlogAuthorActionState = {
  status: "idle",
  message: null,
};
