import type { BlogAuthor } from "@/types/domain";

export const DEFAULT_BLOG_AUTHOR: BlogAuthor = {
  name: "Riad Labrini",
  bio: "Riad Labrini is the founder of Loom & Hearth Studio. He sources and checks every rug in person in Morocco and photographs each piece in Casablanca.",
  photoUrl: null,
};

export function sanitizeBlogAuthor(value: unknown): BlogAuthor {
  const candidate = isRecord(value) ? value : {};
  const name = sanitizeText(candidate.name, DEFAULT_BLOG_AUTHOR.name);
  const bio = sanitizeText(candidate.bio, DEFAULT_BLOG_AUTHOR.bio);
  const photoUrl = sanitizeOptionalUrl(candidate.photoUrl);

  return {
    name,
    bio,
    photoUrl,
  };
}

export function validateBlogAuthor(author: BlogAuthor) {
  if (author.name.trim().length < 2) {
    return {
      status: "invalid" as const,
      message: "Author name must contain at least 2 characters.",
    };
  }

  if (author.bio.trim().length < 12) {
    return {
      status: "invalid" as const,
      message: "Author bio must contain at least 12 characters.",
    };
  }

  if (author.photoUrl) {
    try {
      const parsedUrl = new URL(author.photoUrl);

      if (parsedUrl.protocol !== "https:") {
        return {
          status: "invalid" as const,
          message: "Author photo URL must use https.",
        };
      }
    } catch {
      return {
        status: "invalid" as const,
        message: "Author photo URL must be a valid https URL.",
      };
    }
  }

  return {
    status: "valid" as const,
    value: {
      name: author.name.trim(),
      bio: author.bio.trim(),
      photoUrl: author.photoUrl?.trim() || null,
    },
  };
}

function sanitizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sanitizeOptionalUrl(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
