"use server";

import { revalidatePath } from "next/cache";

import type { NewsletterSignupActionState } from "@/lib/newsletter/actions-shared";
import { subscribeToNewsletter } from "@/lib/newsletter/service";

export async function submitNewsletterSignupAction(
  _previousState: NewsletterSignupActionState,
  formData: FormData,
): Promise<NewsletterSignupActionState> {
  const email = readString(formData.get("email"));

  const result = await subscribeToNewsletter({
    email,
    source: "homepage",
    tags: ["homepage"],
  });

  revalidatePath("/");
  revalidatePath("/admin/newsletter");

  if (result.status === "subscribed") {
    return {
      status: "success",
      message: result.message,
    };
  }

  return {
    status: "error",
    message: result.message,
  };
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
