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
      message: "No signed-in account session is available to sign out.",
      redirectTarget: "/account/login",
    };
  }

  return {
    status: "success",
    message: "Signed out.",
    redirectTarget: "/account/login",
  };
}

export const signOutRequestTodo =
  "Launch sign-out clears the current credentials session. Broader account management remains out of scope.";
