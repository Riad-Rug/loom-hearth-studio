import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.env.IMAGE_BUDGET_ROOT ?? path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");
const limit = 500 * 1024;
const raster = /\.(png|jpe?g|webp|gif|avif)$/i;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

const oversized = [];
for (const file of await walk(publicRoot)) {
  if (!raster.test(file)) continue;
  const { size } = await stat(file);
  if (size > limit) oversized.push({ file, size });
}

if (oversized.length) {
  for (const { file, size } of oversized) {
    console.error(`${path.relative(root, file)} is ${Math.ceil(size / 1024)} KB (${size} bytes); limit is 500 KB (${limit} bytes). Run npm run images.`);
  }
  process.exitCode = 1;
} else {
  console.log("All public raster images are within the 500 KB limit.");
}
