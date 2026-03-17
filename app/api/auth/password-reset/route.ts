import { NextResponse } from "next/server";

import {
  createPasswordResetRequest,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset-service";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    email: string;
  }>;

  const result = await createPasswordResetRequest({
    email: typeof payload.email === "string" ? payload.email : "",
    origin: request.headers.get("origin") ?? undefined,
  });

  return NextResponse.json(result, {
    status: result.status === "invalid-input" ? 400 : 200,
  });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as Partial<{
    token: string;
    password: string;
  }>;

  const result = await resetPasswordWithToken({
    token: typeof payload.token === "string" ? payload.token : "",
    password: typeof payload.password === "string" ? payload.password : "",
  });

  return NextResponse.json(result, {
    status: result.status === "reset" ? 200 : 400,
  });
}
