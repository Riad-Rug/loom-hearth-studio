import type { BlogPost } from "@/types/domain";

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
  imageAlt: string;
  imageSrc: string;
  targetKeyword: string;
  updatedAt: string;
};

export type BlogPostRecord = PlaceholderBlogPost;

export const blogPosts: BlogPostRecord[] = [
  {
    id: "blog-beni-ourain-guide",
    slug: "how-to-read-a-beni-ourain-rug",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "How to Read a Beni Ourain Rug Before It Reaches the Room",
    excerpt:
      "A practical guide to pile depth, knot density, pattern spacing, and the back-of-rug indicators that separate a well-constructed Beni Ourain from a poor one.",
    body: [
      "The best Beni Ourain-style rugs bring softness first. Before pattern, before styling, and before scale, the pile should feel generous enough to catch light and create movement across the room. When the wool looks flat, harsh, or overly uniform, the rug usually reads more decorative than architectural.",
      "Pattern matters most in restraint. The strongest pieces keep the linework open, slightly irregular, and breathable so the rug still reads clearly from a distance. Tight, repetitive diamonds can turn a quiet room busy, while a looser drawing gives the floor visual weight without stealing focus from the furniture above it.",
      "Scale is the final edit. Moroccan rugs work best when they are large enough to anchor the seating area and close enough in tone to sit comfortably beside plaster, wood, leather, and woven accents. That balance is what turns a good rug into the piece that sets the room.",
    ].join("\n\n"),
    publishedAt: "March 18, 2026",
    readTime: "6 min read",
    status: "active",
    imageAlt:
      "A plush neutral bedroom with a soft cream rug that suggests a Beni Ourain-style Moroccan foundation",
    imageSrc:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "How to read a Beni Ourain rug | Loom & Hearth Studio",
    seoDescription:
      "A Loom & Hearth Studio guide to choosing a fluffy, minimalist Beni Ourain-style Moroccan rug with visible pile depth and scale.",
    targetKeyword: "beni ourain rug",
    updatedAt: "2026-03-18T09:30:00.000Z",
  },
  {
    id: "blog-layering-poufs-and-sabra-pillows",
    slug: "layering-poufs-and-sabra-pillows",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "Layering Poufs and Sabra Pillows Without Losing the Room",
    excerpt:
      "A room-by-room guide to combining Moroccan poufs and cactus silk pillows — scale, spacing, colour contrast, and how to avoid too much competing texture.",
    body: [
      "Poufs work best when they solve two things at once: movement and texture. A single leather or striped floor pouf can soften the edge of a seating group, but it should still feel grounded by the rug beneath it and by enough negative space around it to keep the room breathable.",
      "Sabra pillows do the opposite job. They sharpen a sofa, bench, or daybed with a little geometry and faded color, especially when the rest of the palette stays warm and restrained. The goal is not to stack as many as possible, but to let one or two handmade pieces carry the contrast.",
      "The most believable rooms mix the two with discipline. Use the pouf as the lower, quieter anchor and the pillows as the brighter editorial note. That hierarchy keeps the room readable and keeps wool, leather, and cactus silk in balance.",
    ].join("\n\n"),
    publishedAt: "March 16, 2026",
    readTime: "5 min read",
    status: "active",
    imageAlt:
      "Traditional Moroccan cushions in warm sunlight with woven texture and faded sabra-style patterning",
    imageSrc:
      "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    seoTitle: "Layering poufs and sabra pillows | Loom & Hearth Studio",
    seoDescription:
      "Styling notes on using Moroccan poufs and cactus silk pillows with rugs, benches, and daybeds.",
    targetKeyword: "sabra pillows",
    updatedAt: "2026-03-17T14:10:00.000Z",
  },
  {
    id: "blog-sourcing-notes-morocco",
    slug: "why-direct-sourcing-changes-the-collection",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "Why Direct Sourcing in Morocco Changes the Collection",
    excerpt:
      "What becomes possible when rugs, poufs, pillows, and decor are selected in person: better material judgment, stronger category direction, and a more coherent point of view.",
    body: [
      "Collections feel sharper when they are edited close to the source. Seeing Moroccan pieces in person makes it easier to compare wool density, leather finish, hand feel, dye softness, and the small construction details that disappear in a marketplace thumbnail.",
      "That proximity also changes the mix. Instead of buying to fill categories abstractly, the collection can be built around what actually holds up: a quieter rug, a stronger sabra pillow, a more sculptural pouf, or a small decor object that finishes a shelf without feeling ornamental.",
      "For an editorial storefront, that matters. The goal is not volume. It is to keep every piece aligned to the same room, the same material world, and the same standard of selection.",
    ].join("\n\n"),
    publishedAt: "March 12, 2026",
    readTime: "4 min read",
    status: "active",
    imageAlt:
      "A warm Moroccan interior with woven lamps, rattan furniture, and built-in seating that reflects Loom and Hearth Studio's sourcing direction",
    imageSrc:
      "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    seoTitle: "Why direct sourcing changes the collection | Loom & Hearth Studio",
    seoDescription:
      "A sourcing story on how in-person selection in Morocco shapes the Loom & Hearth Studio collection.",
    targetKeyword: "direct sourcing morocco",
    updatedAt: "2026-03-13T11:45:00.000Z",
  },
] as const;

export const blogCategories = Array.from(
  new Map(
    blogPosts.map((post) => [
      post.categorySlug,
      {
        slug: post.categorySlug,
        label: post.categoryLabel,
        href: `/blog/${post.categorySlug}/${post.slug}`,
      },
    ]),
  ).values(),
);

export function getBlogPostByParams(category: string, slug: string) {
  return blogPosts.find(
    (post) => post.categorySlug === category && post.slug === slug,
  );
}
