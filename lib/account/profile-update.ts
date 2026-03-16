import type { AuthRequestStatus } from "@/lib/auth";

export type AccountProfileUpdatePayload = {
  fullName: string;
  email: string;
  phone: string | null;
};

export type AccountProfileUpdateState = {
  status: AuthRequestStatus;
  payload: AccountProfileUpdatePayload | null;
  message: string | null;
};

export function createInitialAccountProfileUpdateState(): AccountProfileUpdateState {
  return {
    status: "idle",
    payload: null,
    message: null,
  };
}

export function createAccountProfileUpdatePayload(input: {
  fullName: string;
  email: string;
  phone: string;
}): AccountProfileUpdatePayload | null {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();

  if (!fullName || !email || !email.includes("@")) {
    return null;
  }

  return {
    fullName,
    email,
    phone: phone || null,
  };
}

export const accountProfileUpdateTodo =
  "TODO: Connect profile update requests to real authenticated account persistence once customer profile storage is implemented.";
