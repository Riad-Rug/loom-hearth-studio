import type { AccountAuthMode } from "@/features/account/account-data";
import type { AccountAccessDecision } from "@/lib/auth/guards";
import type {
  ForgotPasswordRequestState,
  PasswordResetTokenView,
  ResetPasswordState,
} from "@/lib/auth/password-reset";
import type { LoginRequestState, RegisterRequestState } from "@/lib/auth/requests";

export type AccountAuthRequestPresentation = {
  title: string;
  stateLine: string;
  message: string | null;
  payloadLines: string[];
  todoLines: string[];
};

export type AccountAuthRouteViewModel = {
  authBoundary: {
    title: string;
    statusLine: string;
    redirectTargetLine: string;
    todoLine: string;
  };
  guestRoute: {
    title: string;
    body: string;
    redirectTargetLine: string;
  };
  requestPresentation: AccountAuthRequestPresentation;
};

export function createAccountAuthRouteViewModel(input: {
  mode: AccountAuthMode;
  accessDecision: AccountAccessDecision;
  forgotPasswordState: ForgotPasswordRequestState;
  passwordResetTokenView: PasswordResetTokenView;
  resetPasswordState: ResetPasswordState;
  loginState: LoginRequestState;
  registerState: RegisterRequestState;
  accountGuardTodo: string;
  forgotPasswordRequestTodo: string;
  loginRequestTodo: string;
  registerRequestTodo: string;
  emailServiceTodo: string;
}): AccountAuthRouteViewModel {
  const requestPresentation =
    input.mode === "forgot-password"
      ? {
          title:
            input.passwordResetTokenView.status === "valid"
              ? "Reset-password boundary"
              : "Forgot-password boundary",
          stateLine:
            input.passwordResetTokenView.status === "valid"
              ? `Reset request state: ${input.resetPasswordState.status}`
              : `Request state: ${input.forgotPasswordState.status}`,
          message:
            input.passwordResetTokenView.status === "valid"
              ? input.resetPasswordState.message
              : input.forgotPasswordState.message,
          payloadLines: [
            ...(input.forgotPasswordState.payload
              ? [`Request email: ${input.forgotPasswordState.payload.email}`]
              : []),
            ...(input.passwordResetTokenView.email
              ? [`Reset account: ${input.passwordResetTokenView.email}`]
              : []),
            ...(input.passwordResetTokenView.expiresAtLabel
              ? [`Reset link expires ${input.passwordResetTokenView.expiresAtLabel}`]
              : []),
            ...(input.resetPasswordState.payload
              ? ["New password payload is ready for submission."]
              : []),
          ],
          todoLines: [input.forgotPasswordRequestTodo, input.emailServiceTodo],
        }
      : input.mode === "login"
        ? {
            title: "Login boundary",
            stateLine: `Request state: ${input.loginState.status}`,
            message: input.loginState.message,
            payloadLines: input.loginState.payload
              ? [`Request email: ${input.loginState.payload.email}`]
              : [],
            todoLines: [input.loginRequestTodo],
          }
        : {
            title: "Register boundary",
            stateLine: `Request state: ${input.registerState.status}`,
            message: input.registerState.message,
            payloadLines: input.registerState.payload
              ? [
                  `Request customer: ${input.registerState.payload.firstName} ${input.registerState.payload.lastName}`,
                ]
              : [],
            todoLines: [input.registerRequestTodo],
          };

  return {
    authBoundary: {
      title: "Auth boundary",
      statusLine: `${input.accessDecision.sessionSummary.status} on the account surface. Access: ${input.accessDecision.status}.`,
      redirectTargetLine: `Boundary redirect target: ${input.accessDecision.redirectTarget}`,
      todoLine: `${input.accessDecision.sessionSummary.todo} ${input.accountGuardTodo}`,
    },
    guestRoute: {
      title: "Guest-only route",
      body:
        "These auth routes remain available to signed-out customers only. Signed-in customers are redirected to `/account`.",
      redirectTargetLine: `Boundary redirect target: ${input.accessDecision.redirectTarget}`,
    },
    requestPresentation,
  };
}
