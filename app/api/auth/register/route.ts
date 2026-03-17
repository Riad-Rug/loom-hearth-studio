import { NextResponse } from "next/server";

import { registerLaunchUser } from "@/lib/auth/service";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }>;

  if (
    typeof payload.firstName !== "string" ||
    typeof payload.lastName !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.password !== "string"
  ) {
    return NextResponse.json(
      {
        status: "invalid-input",
        message: "Registration request is invalid.",
      },
      { status: 400 },
    );
  }

  const result = await registerLaunchUser({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
  });

  return NextResponse.json(result, {
    status:
      result.status === "created"
        ? 201
        : result.status === "email-taken"
          ? 409
          : 400,
  });
}
