-- Replace the flat imageAlt/imageSrc hero fields on BlogPostEntry with a single
-- `images` JSON array of up to 5 { id, src, alt } objects (index 0 = hero/cover
-- image). Existing rows with a populated imageSrc are folded into a one-element
-- array so nothing goes blank; empty/missing imageSrc rows become [].

ALTER TABLE "BlogPostEntry" ADD COLUMN "images" JSONB;

UPDATE "BlogPostEntry"
SET "images" = CASE
  WHEN "imageSrc" IS NOT NULL AND "imageSrc" <> '' THEN
    jsonb_build_array(
      jsonb_build_object('id', 'image-1', 'src', "imageSrc", 'alt', COALESCE("imageAlt", ''))
    )
  ELSE '[]'::jsonb
END;

ALTER TABLE "BlogPostEntry" ALTER COLUMN "images" SET NOT NULL;

ALTER TABLE "BlogPostEntry" DROP COLUMN "imageAlt";
ALTER TABLE "BlogPostEntry" DROP COLUMN "imageSrc";
