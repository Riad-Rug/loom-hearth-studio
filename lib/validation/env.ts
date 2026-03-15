const requiredAtRuntime = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
] as const;

export function getMissingRuntimeEnv(): string[] {
  return requiredAtRuntime.filter((key) => !process.env[key]);
}
