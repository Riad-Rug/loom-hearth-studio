import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { tmpdir } from "node:os";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const prisma = new PrismaClient();

async function main() {
  const existingBlogPostCount = await prisma.blogPostEntry.count();
  const posts = await loadBlogPosts();
  let syncedPosts = 0;

  for (const post of posts) {
    await prisma.blogPostEntry.upsert({
      where: {
        slug_categorySlug: {
          slug: post.slug,
          categorySlug: post.categorySlug,
        },
      },
      update: mapBlogPostToBlogPostEntry(post),
      create: {
        id: post.id,
        ...mapBlogPostToBlogPostEntry(post),
      },
    });
    syncedPosts += 1;
  }

  const totalBlogPosts = await prisma.blogPostEntry.count();

  console.log(
    JSON.stringify(
      {
        status: "synced",
        existingBlogPostsBeforeSync: existingBlogPostCount,
        syncedPosts,
        totalBlogPosts,
      },
      null,
      2,
    ),
  );
}

async function loadBlogPosts() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const sourcePath = path.resolve(scriptDirectory, "../features/blog/blog-post-data.ts");
  const sourceText = await readFile(sourcePath, "utf8");
  const transpiledModule = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "blog-post-data.ts",
  }).outputText;
  const temporaryModulePath = path.join(
    tmpdir(),
    `loom-hearth-blog-posts-${Date.now()}.mjs`,
  );

  await writeFile(temporaryModulePath, transpiledModule, "utf8");

  const module = await import(pathToFileURL(temporaryModulePath).href);
  return module.blogPosts;
}

function mapBlogPostToBlogPostEntry(post) {
  return {
    slug: post.slug,
    categorySlug: post.categorySlug,
    categoryLabel: post.categoryLabel,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    bodyFormat: post.bodyFormat ?? "plain",
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    status: post.status,
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    targetKeyword: post.targetKeyword,
    ctaLabel: post.ctaLabel,
  };
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
