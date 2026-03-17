export type AuthRequestStatus = "idle" | "submitting" | "success" | "failure";

export type LoginRequestPayload = {
  email: string;
  password: string;
};

export type RegisterRequestPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginRequestState = {
  status: AuthRequestStatus;
  payload: LoginRequestPayload | null;
  message: string | null;
};

export type RegisterRequestState = {
  status: AuthRequestStatus;
  payload: RegisterRequestPayload | null;
  message: string | null;
};

export function createLoginRequestPayload(input: {
  email: string;
  password: string;
}): LoginRequestPayload | null {
  const email = input.email.trim();
  const password = input.password.trim();

  if (!email || !email.includes("@") || !password) {
    return null;
  }

  return {
    email,
    password,
  };
}

export function createRegisterRequestPayload(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): RegisterRequestPayload | null {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  const password = input.password.trim();

  if (!firstName || !lastName || !email || !email.includes("@") || !password) {
    return null;
  }

  return {
    firstName,
    lastName,
    email,
    password,
  };
}

export const loginRequestTodo =
  "Launch login uses Auth.js credentials and server-side session checks.";

export const registerRequestTodo =
  "Launch registration creates a credentials account and signs the customer into the account surface.";
