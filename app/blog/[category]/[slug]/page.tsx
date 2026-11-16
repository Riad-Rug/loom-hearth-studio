import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import type { BlogPostRecord } from "@/features/blog/blog-post-data";
import { BlogProductRail } from "@/features/blog/blog-product-rail";
import { BlogPostPageView } from "@/features/blog/blog-post-page-view";
import { BlogSignupBlock } from "@/features/blog/blog-signup-block";
import { getDefaultBlogAuthor } from "@/lib/blog/author";
import { getBlogPostByParams, getBlogPosts } from "@/lib/blog/posts";
import { getCloudinaryConfig } from "@/lib/cloudinary/config";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema, toSchemaDate, toSchemaDateTime } from "@/lib/seo/schema";

const relatedPostLimit = 2;

/** The link-preview size Facebook and LinkedIn recommend. */
const ogImageSize = { width: 1200, height: 630 };

/**
 * A stored URL whose first segment after /upload/ is already a transformation
 * ("w_800/v123/…"). A crop chained in front of it would not decide the output
 * size, so such a URL is published as stored.
 */
const cloudinaryTransformationPrefix = /^[a-z]{1,3}_[^/]*\//u;

type BlogPostPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post =
    posts.find(
      (candidate) =>
        candidate.categorySlug === resolvedParams.category && candidate.slug === resolvedParams.slug,
    ) ?? null;

  if (!post) {
    notFound();
  }

  // Related links must come from the same published set as the post itself, never from
  // the placeholder data in features/blog/blog-post-data.ts, which links to paths that
  // do not exist in production.
  const relatedPosts = selectRelatedPosts(post, posts);
  const author = await getDefaultBlogAuthor();

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${post.categorySlug}/${post.slug}`,
            publishedAt: post.publishedAt,
            modifiedAt: post.updatedAt,
            imageUrl: post.images[0]?.src || null,
            author: author.name ? { name: author.name, photoUrl: author.photoUrl } : null,
          }),
          // The final crumb is the post itself, not its category: there is no
          // /blog/[category] route for a category crumb to point at, so labelling this
          // crumb with post.categoryLabel while pointing it at the post's own permalink
          // made the name and the item URL disagree. If a real category index is ever
          // added, insert a category crumb ahead of this one rather than relabelling it.
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.categorySlug}/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostPageView
        author={author}
        post={post}
        productRail={<BlogProductRail post={post} />}
        relatedPosts={relatedPosts}
        signup={<BlogSignupBlock />}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostByParams(resolvedParams.category, resolvedParams.slug);

  if (!post) {
    return buildMetadata({
      title: "Blog",
      description: "Editorial blog index for Loom & Hearth Studio.",
      path: "/blog",
    });
  }

  const heroImage = post.images[0];
  const ogImage = heroImage?.src ? toOpenGraphImage(heroImage.src) : null;
  const author = await getDefaultBlogAuthor();
  const metadata = await buildManagedMetadata({
    entityType: "blog_post",
    entityKey: post.id,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.categorySlug}/${post.slug}`,
    type: "article",
    ...(heroImage?.src
      ? {
          ogImageUrl: ogImage?.url ?? heroImage.src,
          ogImageAlt: heroImage.alt || post.title,
          ogImageWidth: ogImage?.width,
          ogImageHeight: ogImage?.height,
        }
      : {}),
  });
  const publishedTime = toSchemaDate(post.publishedAt);
  const modifiedTime = toSchemaDateTime(post.updatedAt);

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      authors: [author.name],
    },
  };
}

function selectRelatedPosts(post: BlogPostRecord, posts: BlogPostRecord[]) {
  const sameCategory = (candidate: BlogPostRecord) => (candidate.categorySlug === post.categorySlug ? 1 : 0);
  const publishedDay = (candidate: BlogPostRecord) => toSchemaDate(candidate.publishedAt) ?? "";

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .sort(
      (left, right) =>
        sameCategory(right) - sameCategory(left) ||
        compareText(publishedDay(right), publishedDay(left)) ||
        compareText(left.id, right.id),
    )
    .slice(0, relatedPostLimit);
}

function compareText(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Blog photos are stored as full delivery URLs. One on the site's own Cloudinary
 * account is re-delivered through the builder the product pages use, cropped to
 * the link-preview size so the declared width and height are true, and as JPEG
 * because a hero can be a multi-megabyte PNG. Anything else is published as
 * stored, with no size.
 */
function toOpenGraphImage(src: string) {
  const uploadPrefix = `${getCloudinaryConfig().baseDeliveryUrl}/`;
  const assetPath = src.startsWith(uploadPrefix) ? src.slice(uploadPrefix.length) : "";

  if (!assetPath || cloudinaryTransformationPrefix.test(assetPath)) {
    return null;
  }

  return {
    url: buildCloudinaryUrl(assetPath, {
      transformation: { c: "fill", g: "auto", w: ogImageSize.width, h: ogImageSize.height, q: "auto", f: "jpg" },
    }),
    ...ogImageSize,
  };
}
