"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import {
  accountAuthContent,
  type AccountAuthMode,
} from "@/features/account/account-data";
import {
  accountGuardTodo,
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

    window.setTimeout(() => {
      if (!payload) {
        setLoginState({
          status: "failure",
          payload: null,
          message: "Enter a valid email address and password to create the placeholder login request.",
        });
        return;
      }

      setLoginState({
        status: "success",
        payload,
        message:
          "Placeholder login request created. Real session creation and persistence are not implemented.",
      });
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

    window.setTimeout(() => {
      if (!payload) {
        setRegisterState({
          status: "failure",
          payload: null,
          message:
            "Complete first name, last name, email, and password to create the placeholder registration request.",
        });
        return;
      }

      setRegisterState({
        status: "success",
        payload,
        message:
          "Placeholder registration request created. Real account creation is not implemented.",
      });
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
            <strong>Auth boundary</strong>
            <span>
              {accessDecision.sessionSummary.status} on the account surface. Access:{" "}
              {accessDecision.status}.
            </span>
            <span>Boundary redirect target: {accessDecision.redirectTarget}</span>
            <span>
              {accessDecision.sessionSummary.todo} {accountGuardTodo}
            </span>
          </div>
          <div className={styles.authLinks}>
            <Link href={"/account/login" as Route}>Login</Link>
            <Link href={"/account/register" as Route}>Register</Link>
            <Link href={"/account/forgot-password" as Route}>Forgot password</Link>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.sessionNote}>
            <strong>Guest-only route</strong>
            <span>
              These auth routes remain available to signed-out customers only at the
              boundary level. Placeholder signed-in customers would be redirected to
              `/account` once real auth exists.
            </span>
            <span>Boundary redirect target: {accessDecision.redirectTarget}</span>
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

            {mode === "forgot-password" ? (
              <div className={styles.sessionNote}>
                <strong>Forgot-password boundary</strong>
                <span>Request state: {requestState.status}</span>
                {requestState.message ? <span>{requestState.message}</span> : null}
                {requestState.payload ? <span>Request email: {requestState.payload.email}</span> : null}
                {requestState.resetEmailPreview ? (
                  <>
                    <span>Email payload ready for: {requestState.resetEmailPreview.to}</span>
                    <span>Subject: {requestState.resetEmailPreview.subject}</span>
                  </>
                ) : null}
                <span>{forgotPasswordRequestTodo}</span>
                <span>{emailServiceTodo}</span>
              </div>
            ) : mode === "login" ? (
              <div className={styles.sessionNote}>
                <strong>Login boundary</strong>
                <span>Request state: {loginState.status}</span>
                {loginState.message ? <span>{loginState.message}</span> : null}
                {loginState.payload ? <span>Request email: {loginState.payload.email}</span> : null}
                <span>{loginRequestTodo}</span>
              </div>
            ) : (
              <div className={styles.sessionNote}>
                <strong>Register boundary</strong>
                <span>Request state: {registerState.status}</span>
                {registerState.message ? <span>{registerState.message}</span> : null}
                {registerState.payload ? (
                  <span>
                    Request customer: {registerState.payload.firstName}{" "}
                    {registerState.payload.lastName}
                  </span>
                ) : null}
                <span>{registerRequestTodo}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
