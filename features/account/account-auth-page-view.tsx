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
  createForgotPasswordResetEmailPreview,
  createLoginRequestPayload,
  createRegisterRequestPayload,
  forgotPasswordRequestTodo,
  getAccountAccessDecision,
  loginRequestTodo,
  registerRequestTodo,
  type ForgotPasswordRequestState,
  type LoginRequestState,
  type RegisterRequestState,
} from "@/lib/auth";
import { emailServiceTodo } from "@/lib/email";

import styles from "./account.module.css";

type AccountAuthPageViewProps = {
  mode: AccountAuthMode;
};

export function AccountAuthPageView({ mode }: AccountAuthPageViewProps) {
  const content = accountAuthContent[mode];
  const accessDecision = getAccountAccessDecision({
    user: null,
    routeKind: mode,
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestState, setRequestState] = useState<ForgotPasswordRequestState>({
    status: "idle",
    payload: null,
    resetEmailPreview: null,
    message: null,
  });
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
      resetEmailPreview: null,
      message: null,
    });

    window.setTimeout(() => {
      if (!payload) {
        setRequestState({
          status: "failure",
          payload: null,
          resetEmailPreview: null,
          message: "Enter a valid email address to create the placeholder password-reset request.",
        });
        return;
      }

      setRequestState({
        status: "success",
        payload,
        resetEmailPreview: createForgotPasswordResetEmailPreview(payload),
        message:
          "Placeholder forgot-password request created. Real token generation and email delivery are not implemented.",
      });
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
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {mode !== "forgot-password" ? (
              <label className={styles.field}>
                <span>Password</span>
                <input
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            ) : null}

            <button
              className={styles.primaryAction}
              type="button"
              onClick={
                mode === "forgot-password"
                  ? handleForgotPasswordRequest
                  : mode === "login"
                    ? handleLoginRequest
                    : handleRegisterRequest
              }
            >
              {content.primaryLabel}
            </button>

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
