"use client";

import type { Route } from "next";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import {
  accountAuthContent,
  type AccountAuthMode,
} from "@/features/account/account-data";
import {
  accountGuardTodo,
  createAccountAuthRouteViewModel,
  createForgotPasswordRequestPayload,
  createInitialForgotPasswordRequestState,
  createInitialResetPasswordState,
  createLoginRequestPayload,
  createRegisterRequestPayload,
  createResetPasswordPayload,
  forgotPasswordRequestTodo,
  getAccountAccessDecision,
  loginRequestTodo,
  registerRequestTodo,
  type ForgotPasswordRequestState,
  type LoginRequestState,
  type PasswordResetTokenView,
  type RegisterRequestState,
  type ResetPasswordState,
} from "@/lib/auth";
import { emailServiceTodo } from "@/lib/email";

import styles from "./account.module.css";

type AccountAuthPageViewProps = {
  mode: AccountAuthMode;
  passwordResetTokenView?: PasswordResetTokenView;
  surface?: "account" | "admin";
};

type AuthSurfaceContent = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  formTitle: string;
  formBody: string;
  supportTitle: string;
  supportBody: string;
  reassurance: string;
};

type CustomerAuthSwitchContent = {
  prompt: string;
  label: string;
  href: Route;
};

const adminLoginContent: AuthSurfaceContent = {
  eyebrow: "Admin login",
  title: "Sign in to the admin area",
  body:
    "Use an approved Loom & Hearth Studio admin account to access the back-office and continue into `/admin`.",
  primaryLabel: "Sign in to admin",
  formTitle: "Back-office sign-in",
  formBody:
    "Enter the admin-enabled email and password associated with your back-office access.",
  supportTitle: "Separate from the customer account surface",
  supportBody:
    "This login is reserved for approved back-office access. Customer sign-in and account recovery continue on the storefront account routes.",
  reassurance:
    "If you need customer account access instead, return to the customer login page.",
};

function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");

  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }

  const nameParts = cleaned.split(" ");

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: nameParts[0] };
  }

  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" "),
  };
}

export function AccountAuthPageView({
  mode,
  passwordResetTokenView,
  surface = "account",
}: AccountAuthPageViewProps) {
  const isAdminSurface = surface === "admin";
  const isResetMode =
    mode === "forgot-password" && passwordResetTokenView?.status === "valid";
  const content: AuthSurfaceContent = isAdminSurface
    ? adminLoginContent
    : accountAuthContent[mode];
  const accessDecision = getAccountAccessDecision({
    user: null,
    routeKind: mode,
  });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(passwordResetTokenView?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestState, setRequestState] = useState<ForgotPasswordRequestState>(
    createInitialForgotPasswordRequestState(),
  );
  const [resetPasswordState, setResetPasswordState] = useState<ResetPasswordState>(
    createInitialResetPasswordState(),
  );
  const [loginState, setLoginState] = useState<LoginRequestState>({
    status: "idle",
    payload: null,
    message: null,
  });
  const [registerState, setRegisterState] = useState<RegisterRequestState>({
    status: "idle",
    payload: null,
    message: null,
  });
  const routeViewModel = createAccountAuthRouteViewModel({
    mode,
    surface,
    redirectTargetOverride: isAdminSurface ? "/admin/login" : undefined,
    accessDecision,
    forgotPasswordState: requestState,
    passwordResetTokenView:
      passwordResetTokenView ?? {
        token: null,
        status: "request",
        email: null,
        expiresAtLabel: null,
      },
    resetPasswordState,
    loginState,
    registerState,
    accountGuardTodo,
    forgotPasswordRequestTodo,
    loginRequestTodo,
    registerRequestTodo,
    emailServiceTodo,
  });

  function handleForgotPasswordRequest() {
    const payload = createForgotPasswordRequestPayload(email);

    setRequestState({
      status: "submitting",
      payload,
      message: null,
    });

    window.setTimeout(async () => {
      if (!payload) {
        setRequestState({
          status: "failure",
          payload: null,
          message: "Enter a valid email address before requesting a password reset.",
        });
        return;
      }

      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        status: "sent" | "invalid-input" | "configuration-error" | "api-error";
        message: string;
      };

      setRequestState({
        status: response.ok && result.status === "sent" ? "success" : "failure",
        payload,
        message: result.message,
      });
    }, 350);
  }

  function handleResetPasswordRequest() {
    const payload = createResetPasswordPayload({
      token: passwordResetTokenView?.token ?? null,
      password,
      confirmPassword,
    });

    setResetPasswordState({
      status: "submitting",
      payload,
      message: null,
    });

    window.setTimeout(async () => {
      if (!payload) {
        setResetPasswordState({
          status: "failure",
          payload: null,
          message: "Enter matching passwords before resetting your account password.",
        });
        return;
      }

      const response = await fetch("/api/auth/password-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: payload.token,
          password: payload.password,
        }),
      });
      const result = (await response.json()) as {
        status:
          | "reset"
          | "invalid-input"
          | "invalid-token"
          | "expired-token"
          | "used-token";
        message: string;
      };

      setResetPasswordState({
        status: response.ok && result.status === "reset" ? "success" : "failure",
        payload,
        message: result.message,
      });

      if (response.ok && result.status === "reset") {
        window.setTimeout(() => {
          window.location.assign("/account/login");
        }, 800);
      }
    }, 350);
  }

  function handleLoginRequest() {
    const payload = createLoginRequestPayload({ email, password });

    setLoginState({
      status: "submitting",
      payload,
      message: null,
    });

    window.setTimeout(async () => {
      if (!payload) {
        setLoginState({
          status: "failure",
          payload: null,
          message: "Enter a valid email address and password before signing in.",
        });
        return;
      }

      const result = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
        callbackUrl: isAdminSurface ? "/admin" : "/account",
        surface: isAdminSurface ? "admin-login" : "account-login",
      });

      if (result?.error) {
        setLoginState({
          status: "failure",
          payload,
          message: "The email or password was not accepted.",
        });
        return;
      }

      setLoginState({
        status: "success",
        payload,
        message: "Signed in.",
      });

      window.location.assign(result?.url ?? (isAdminSurface ? "/admin" : "/account"));
    }, 350);
  }

  function handleRegisterRequest() {
    const names = splitFullName(fullName);
    const payload = createRegisterRequestPayload({
      firstName: names.firstName,
      lastName: names.lastName,
      email,
      password,
    });

    setRegisterState({
      status: "submitting",
      payload,
      message: null,
    });

    window.setTimeout(async () => {
      if (!payload) {
        setRegisterState({
          status: "failure",
          payload: null,
          message:
            "Complete your full name, email, and password before creating an account.",
        });
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        status: "created" | "email-taken" | "invalid-input";
        message: string;
      };

      if (!response.ok || result.status !== "created") {
        setRegisterState({
          status: "failure",
          payload,
          message: result.message,
        });
        return;
      }

      const signInResult = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
        callbackUrl: "/account",
      });

      setRegisterState({
        status: "success",
        payload,
        message: "Account created.",
      });

      window.location.assign(signInResult?.url ?? "/account");
    }, 350);
  }

  const isCustomerSurface = !isAdminSurface;
  const showCuratedSurface = isCustomerSurface || isAdminSurface;
  const currentFeedbackState =
    mode === "login"
      ? loginState
      : mode === "register"
        ? registerState
        : isResetMode
          ? resetPasswordState
          : requestState;
  const currentFeedbackMessage =
    currentFeedbackState.status === "submitting"
      ? mode === "login"
        ? isAdminSurface
          ? "Signing you into admin..."
          : "Signing you in..."
        : mode === "register"
          ? "Creating your account..."
          : isResetMode
            ? "Updating your password..."
            : "Sending reset email..."
      : currentFeedbackState.message;
  const formTitle =
    mode === "forgot-password" && isResetMode ? "Set a new password" : content.formTitle;
  const formBody =
    mode === "forgot-password" && isResetMode
      ? `Create a new password for ${passwordResetTokenView?.email}. After a successful reset you will be redirected back to sign in.`
      : content.formBody;
  const customerAuthSwitchContent: CustomerAuthSwitchContent | null = isAdminSurface
    ? null
    : mode === "login"
      ? {
          prompt: "Don't have an account?",
          label: "Create one",
          href: "/account/register",
        }
      : mode === "register"
        ? {
            prompt: "Already have an account?",
            label: "Sign in",
            href: "/account/login",
          }
        : {
            prompt: "Remembered your password?",
            label: "Back to sign in",
            href: "/account/login",
          };

  return (
    <div className={styles.page}>
      <section className={styles.authShell}>
        <div className={styles.authIntro}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className={styles.lede}>{content.body}</p>

          {showCuratedSurface ? (
            <div className={styles.authSupportNote}>
              <strong>{content.supportTitle}</strong>
              <span>{content.supportBody}</span>
            </div>
          ) : (
            <div className={styles.sessionNote}>
              <strong>{routeViewModel.authBoundary.title}</strong>
              <span>{routeViewModel.authBoundary.statusLine}</span>
              <span>{routeViewModel.authBoundary.redirectTargetLine}</span>
              <span>{routeViewModel.authBoundary.todoLine}</span>
            </div>
          )}

          {isAdminSurface ? (
            <div className={styles.authLinks}>
              <Link href={"/admin/login" as Route}>Admin login</Link>
              <Link href={"/account/login" as Route}>Customer login</Link>
              <Link href={"/account/forgot-password" as Route}>Forgot password</Link>
            </div>
          ) : null}
        </div>

        <div className={styles.formCard}>
          {showCuratedSurface ? (
            <div className={styles.formIntro}>
              <h2>{formTitle}</h2>
              <p>{formBody}</p>
            </div>
          ) : (
            <div className={styles.sessionNote}>
              <strong>{routeViewModel.guestRoute.title}</strong>
              <span>{routeViewModel.guestRoute.body}</span>
              <span>{routeViewModel.guestRoute.redirectTargetLine}</span>
            </div>
          )}

          <div className={styles.formStack}>
            {mode === "register" ? (
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  placeholder="Jordan Smith"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
            ) : null}

            <label className={styles.field}>
              <span>Email address</span>
              <input
                placeholder="name@example.com"
                type="email"
                value={email}
                disabled={isResetMode}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {mode !== "forgot-password" || isResetMode ? (
              <label className={styles.field}>
                <span>{isResetMode ? "New password" : "Password"}</span>
                <input
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            ) : null}

            {isResetMode ? (
              <label className={styles.field}>
                <span>Confirm new password</span>
                <input
                  placeholder="********"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            ) : null}

            {mode === "forgot-password" &&
            passwordResetTokenView &&
            passwordResetTokenView.status !== "request" &&
            passwordResetTokenView.status !== "valid" ? (
              <div className={`${styles.requestFeedback} ${styles.requestFeedbackFailure}`}>
                <strong>Password reset link status</strong>
                <span>
                  {passwordResetTokenView.status === "expired"
                    ? "This password reset link has expired."
                    : passwordResetTokenView.status === "used"
                      ? "This password reset link has already been used."
                      : "This password reset link is invalid."}
                </span>
                <span>Request a new reset link below.</span>
              </div>
            ) : null}

            <button
              className={styles.primaryAction}
              type="button"
              onClick={
                mode === "forgot-password"
                  ? isResetMode
                    ? handleResetPasswordRequest
                    : handleForgotPasswordRequest
                  : mode === "login"
                    ? handleLoginRequest
                    : handleRegisterRequest
              }
            >
              {mode === "forgot-password" && isResetMode
                ? "Reset password"
                : content.primaryLabel}
            </button>

            {showCuratedSurface ? (
              <div className={styles.formMeta}>
                <p className={styles.formReassurance}>{content.reassurance}</p>
                {customerAuthSwitchContent ? (
                  <div className={styles.formMetaLinks}>
                    {mode === "login" ? (
                      <div className={styles.loginSecondaryGrid}>
                        <span>{customerAuthSwitchContent.prompt}</span>
                        <Link href={customerAuthSwitchContent.href}>
                          {customerAuthSwitchContent.label}
                        </Link>
                        <Link
                          className={styles.inlineSecondaryLink}
                          href={"/account/forgot-password" as Route}
                        >
                          Forgot password?
                        </Link>
                        <Link
                          className={styles.inlineSecondaryLink}
                          href={"/admin/login" as Route}
                        >
                          Admin login
                        </Link>
                      </div>
                    ) : (
                      <div className={styles.inlineSwitch}>
                        <span>{customerAuthSwitchContent.prompt}</span>
                        <Link href={customerAuthSwitchContent.href}>
                          {customerAuthSwitchContent.label}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.formSupportLinks}>
                    <Link href={"/account/login" as Route}>Customer login</Link>
                    <Link href={"/account/forgot-password" as Route}>Password help</Link>
                  </div>
                )}
              </div>
            ) : null}

            {showCuratedSurface ? (
              currentFeedbackState.status !== "idle" ? (
                <div
                  className={`${styles.requestFeedback} ${
                    currentFeedbackState.status === "failure"
                      ? styles.requestFeedbackFailure
                      : currentFeedbackState.status === "success"
                        ? styles.requestFeedbackSuccess
                        : ""
                  }`}
                >
                  <strong>
                    {currentFeedbackState.status === "failure"
                      ? "There was a problem"
                      : currentFeedbackState.status === "success"
                        ? "You are all set"
                        : "Processing"}
                  </strong>
                  {currentFeedbackMessage ? <span>{currentFeedbackMessage}</span> : null}
                </div>
              ) : null
            ) : (
              <div className={styles.sessionNote}>
                <strong>{routeViewModel.requestPresentation.title}</strong>
                <span>{routeViewModel.requestPresentation.stateLine}</span>
                {routeViewModel.requestPresentation.message ? (
                  <span>{routeViewModel.requestPresentation.message}</span>
                ) : null}
                {routeViewModel.requestPresentation.payloadLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                {routeViewModel.requestPresentation.todoLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}