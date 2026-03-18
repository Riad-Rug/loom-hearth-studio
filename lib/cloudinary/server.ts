import "server-only";

import { createHash } from "node:crypto";

export function signCloudinaryUploadParams(
  params: Record<string, number | string | undefined>,
  apiSecret: string,
) {
  const serializedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");

  return createHash("sha1")
    .update(`${serializedParams}${apiSecret}`)
    .digest("hex");
}
