import manifest from "@/lib/media/static-images.generated.json";

type StaticImageStem = keyof typeof manifest;
type StaticImageSlot = "hero" | "card" | "thumb";

export function staticImageSrc(stem: StaticImageStem, slot: StaticImageSlot): string {
  return manifest[stem][slot];
}
