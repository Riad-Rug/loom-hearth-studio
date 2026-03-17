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
  type PasswordResetTokenView,
  type ForgotPasswordRequestState,
  type LoginRequestState,
  type ResetPasswordState,
  type RegisterRequestState,
} from "@/lib/auth";
import { emailServiceTodo } from "@/lib/email";

import styles from "./account.module.css";

type AccountAuthPageViewProps = {
  mode: AccountAuthMode;
  passwordResetTokenView?: PasswordResetTokenView;
};

export function AccountAuthPageView({
  mode,
  passwordResetTokenView,
}: AccountAuthPageViewProps) {
  const content = accountAuthContent[mode];
  const accessDecision = getAccountAccessDecision({
    user: null,
    routeKind: mode,
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
        callbackUrl: "/account",
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

      window.location.assign(result?.url ?? "/account");
    }, 350);
  }

  function handleRegisterRequest() {
    const payload = createRegisterRequestPayload({
      firstName,
      lastName,
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
            "Complete first name, last name, email, and password before creating an account.",
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

  const isResetMode =
    mode === "forgot-password" && passwordResetTokenView?.status === "valid";

  return (
    <div className={styles.page}>
      <section className={styles.authShell}>
        <div className={styles.authIntro}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className={styles.lede}>{content.body}</p>
          <div className={styles.sessionNote}>
            <strong>{routeViewModel.authBoundary.title}</strong>
            <span>{routeViewModel.authBoundary.statusLine}</span>
            <span>{routeViewModel.authBoundary.redirectTargetLine}</span>
            <span>{routeViewModel.authBoundary.todoLine}</span>
          </div>
          <div className={styles.authLinks}>
            <Link href={"/account/login" as Route}>Login</Link>
            <Link href={"/account/register" as Route}>Register</Link>
            <Link href={"/account/forgot-password" as Route}>Forgot password</Link>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.sessionNote}>
            <strong>{routeViewModel.guestRoute.title}</strong>
            <span>{routeViewModel.guestRoute.body}</span>
            <span>{routeViewModel.guestRoute.redirectTargetLine}</span>
          </div>
          <div className={styles.formStack}>
            {mode === "register" ? (
              <>
                <label className={styles.field}>
                  <span>First name</span>
                  <input
                    placeholder="Jordan"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>Last name</span>
                  <input
                    placeholder="Smith"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>
              </>
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
                  placeholder="••••••••"
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
                  placeholder="••••••••"
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
              <div className={styles.sessionNote}>
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

            {mode === "forgot-password" && isResetMode ? (
              <p className={styles.lede}>
                Set a new password for {passwordResetTokenView?.email}. After a successful reset
                you will be redirected to sign in.
              </p>
            ) : null}

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
          </div>
        </div>
      </section>
    </div>
  );
}
