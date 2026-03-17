export const envDefinitions = {
  NEXT_PUBLIC_SITE_URL: {
    scope: "public",
    required: false,
    description: "Canonical site URL override for metadata and SEO foundations.",
  },
  DATABASE_URL: {
    scope: "server",
    required: false,
    description: "Database connection string. Database choice is still unresolved.",
  },
  AUTH_SECRET: {
    scope: "server",
    required: false,
    description: "Auth secret placeholder. Auth provider is still unresolved.",
  },
  STRIPE_SECRET_KEY: {
    scope: "server",
    required: false,
    description: "Stripe secret key placeholder for future payment integration.",
  },
  STRIPE_WEBHOOK_SECRET: {
    scope: "server",
    required: false,
    description: "Stripe webhook secret placeholder for future payment integration.",
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    scope: "public",
    required: false,
    description: "Stripe publishable key placeholder for future payment integration.",
  },
  CLOUDINARY_CLOUD_NAME: {
    scope: "server",
    required: false,
    description: "Cloudinary cloud name placeholder for future media delivery.",
  },
  CLOUDINARY_API_KEY: {
    scope: "server",
    required: false,
    description: "Cloudinary API key placeholder for future media management.",
  },
  CLOUDINARY_API_SECRET: {
    scope: "server",
    required: false,
    description: "Cloudinary API secret placeholder for future media management.",
  },
  EMAIL_FROM: {
    scope: "server",
    required: false,
    description: "Transactional email sender address for Postmark delivery.",
  },
  POSTMARK_SERVER_TOKEN: {
    scope: "server",
    required: false,
    description: "Postmark server token for transactional email delivery.",
  },
  NEWSLETTER_API_KEY: {
    scope: "server",
    required: false,
    description: "Newsletter provider API key placeholder. Provider is unresolved.",
  },
} as const;

export type EnvKey = keyof typeof envDefinitions;

export const envGroups = {
  site: ["NEXT_PUBLIC_SITE_URL"],
  database: ["DATABASE_URL"],
  auth: ["AUTH_SECRET"],
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ],
  cloudinary: [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ],
  email: ["EMAIL_FROM", "POSTMARK_SERVER_TOKEN"],
  newsletter: ["NEWSLETTER_API_KEY"],
} as const satisfies Record<string, readonly EnvKey[]>;

type EnvShape = {
  [Key in EnvKey]: string | undefined;
};

function readEnvValue(key: EnvKey) {
  const value = process.env[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function getEnvSnapshot(): EnvShape {
  return Object.keys(envDefinitions).reduce((accumulator, key) => {
    const typedKey = key as EnvKey;
    accumulator[typedKey] = readEnvValue(typedKey);
    return accumulator;
  }, {} as EnvShape);
}

export function getPublicEnv() {
  const env = getEnvSnapshot();

  return {
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  } as const;
}

export function getMissingEnv(keys: readonly EnvKey[]) {
  return keys.filter((key) => !readEnvValue(key));
}

export function getMissingEnvForGroup(group: keyof typeof envGroups) {
  return getMissingEnv(envGroups[group]);
}

export function getRequiredEnvKeys() {
  return (Object.keys(envDefinitions) as EnvKey[]).filter(
    (key) => envDefinitions[key].required,
  );
}

export function getMissingRuntimeEnv() {
  return getMissingEnv(getRequiredEnvKeys());
}
