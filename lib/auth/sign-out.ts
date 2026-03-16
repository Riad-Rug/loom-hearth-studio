import type { AuthRequestStatus } from "@/lib/auth/requests";

export type SignOutRequestState = {
  status: AuthRequestStatus;
  message: string | null;
  redirectTarget: "/account/login" | null;
};

export function createInitialSignOutRequestState(): SignOutRequestState {
  return {
    status: "idle",
    message: null,
    redirectTarget: null,
  };
}

export function createPlaceholderSignOutRequestState(input: {
  isAuthenticated: boolean;
}): SignOutRequestState {
  if (!input.isAuthenticated) {
    return {
      status: "failure",
      message: "No placeholder signed-in account session is available to sign out.",
      redirectTarget: "/account/login",
    };
  }

  return {
    status: "success",
    message:
      "Placeholder sign-out request created. Real session clearing and redirect execution are not implemented.",
    redirectTarget: "/account/login",
  };
}

export const signOutRequestTodo =
  "TODO: Connect sign-out requests to the real auth provider and session clearing flow once auth is implemented.";
