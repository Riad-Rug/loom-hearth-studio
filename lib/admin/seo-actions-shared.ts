export type AdminSeoActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  recordKey: string | null;
  savedFields?: {
    title: string;
    description: string;
    canonicalUrl: string;
    robotsIndex: boolean;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
  };
};

export const initialAdminSeoActionState: AdminSeoActionState = {
  status: "idle",
  message: null,
  recordKey: null,
};