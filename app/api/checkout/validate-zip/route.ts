import { NextResponse } from "next/server";
import zipcodes from "zipcodes";

export async function GET(request: Request) {
  const postalCode = new URL(request.url).searchParams.get("postalCode");

  if (!postalCode || !/^\d{5}$/.test(postalCode)) {
    return NextResponse.json({ state: null });
  }

  const match = zipcodes.lookup(postalCode);

  return NextResponse.json({ state: match?.state ?? null });
}
