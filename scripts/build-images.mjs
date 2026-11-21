import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(root, "assets-src");
const publicRoot = path.join(root, "public");
const slots = [400, 800, 1920];

async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

for (const source of await walk(sourceRoot)) {
  if (!/\.(png|jpe?g)$/i.test(source)) continue;
  const metadata = await sharp(source).metadata();
  if (!metadata.width) throw new Error(`Cannot read image width: ${source}`);
  const relative = path.relative(sourceRoot, source);
  const stem = relative.replace(/\.(png|jpe?g)$/i, "");
  const widths = [...new Set(slots.map((width) => Math.min(width, metadata.width)))];
  for (const width of widths) {
    const slot = width <= 400 ? "thumb" : width <= 800 ? "card" : "hero";
    const output = path.join(publicRoot, `${stem}-${slot}.webp`);
    await mkdir(path.dirname(output), { recursive: true });
    const sourceStat = await stat(source);
    try {
      if ((await stat(output)).mtimeMs >= sourceStat.mtimeMs) continue;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await sharp(source).resize({ width: Math.min(width, metadata.width), withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
  }
}
